"use client";
import React, { useState, useRef, useEffect } from 'react';
import {
  format,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  addDays,
  isWithinInterval,
  isBefore,
  startOfDay,
  differenceInCalendarDays,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval
} from 'date-fns';
import { ChevronDown, Minus, Plus, X, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUi } from '@/context/UiContext';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

type BookingBarProps = {
  listingId?: string;
  basePricePerNight?: number | null;
  minStayNights?: number | null;
  maxGuests?: number | null;
  onDateChange?: (payload: { startDate: Date | null; endDate: Date | null }) => void;
};

const BookingBar = ({ listingId, basePricePerNight = null, minStayNights = 1, maxGuests = 8, onDateChange }: BookingBarProps) => {
  const { isLoginModalOpen, setIsLoginModalOpen, showToast } = useUi();
  const router = useRouter();
  const { data: session } = useSession();
  const [activePopup, setActivePopup] = useState<'calendar' | 'guests' | null>(null);
  const [calendarSelection, setCalendarSelection] = useState<'checkIn' | 'checkOut'>('checkIn');
  const [viewDate, setViewDate] = useState(new Date());
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [guests, setGuests] = useState({ adults: 1, children: 0, infants: 0, pets: 0 });
  const [dateError, setDateError] = useState<string | null>(null);

  const safeMinStay = Math.max(1, Number(minStayNights || 1));
  const safeMaxGuests = Math.max(1, Number(maxGuests || 8));
  const nightlyPrice = typeof basePricePerNight === 'number' ? basePricePerNight : null;

  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside (only for desktop, as mobile backdrop handles it)
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActivePopup(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Calendar Logic
  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(viewDate)),
    end: endOfWeek(endOfMonth(viewDate)),
  });

  const handleDateClick = (day: Date) => {
    if (isBefore(day, startOfDay(new Date()))) return;

    if (calendarSelection === 'checkIn' || !startDate || (startDate && endDate)) {
      setStartDate(day);
      setEndDate(null);
      setDateError(null);
      setCalendarSelection('checkOut');

      const minCheckoutDate = addDays(day, safeMinStay);
      if (!isSameMonth(day, minCheckoutDate)) {
        setViewDate(minCheckoutDate);
      }
    } else {
      if (isBefore(day, startDate)) {
        setStartDate(day);
        setEndDate(null);
        setDateError(null);
        setCalendarSelection('checkOut');

        const minCheckoutDate = addDays(day, safeMinStay);
        if (!isSameMonth(day, minCheckoutDate)) {
          setViewDate(minCheckoutDate);
        }
      } else {
        const nights = differenceInCalendarDays(day, startDate);
        if (nights < safeMinStay) {
          setEndDate(null);
          setDateError(`Minimum stay is ${safeMinStay} night${safeMinStay > 1 ? 's' : ''}.`);
          const minCheckoutDate = addDays(startDate, safeMinStay);
          if (!isSameMonth(viewDate, minCheckoutDate)) {
            setViewDate(minCheckoutDate);
          }
          return;
        }
        setEndDate(day);
        setDateError(null);
        setCalendarSelection('checkIn');
        setTimeout(() => setActivePopup(null), 300);
      }
    }
  };

  useEffect(() => {
    onDateChange?.({ startDate, endDate });
  }, [startDate, endDate, onDateChange]);

  const openCalendar = (selection: 'checkIn' | 'checkOut') => {
    setActivePopup('calendar');
    if (selection === 'checkOut' && !startDate) {
      setCalendarSelection('checkIn');
      return;
    }
    setCalendarSelection(selection);
    if (selection === 'checkOut' && startDate) {
      const minCheckoutDate = addDays(startDate, safeMinStay);
      if (!isSameMonth(viewDate, minCheckoutDate)) {
        setViewDate(minCheckoutDate);
      }
    }
  };

  const totalGuests = guests.adults + guests.children;
  const totalNights = startDate && endDate ? differenceInCalendarDays(endDate, startDate) : 0;
  const totalPrice = nightlyPrice && totalNights > 0 ? nightlyPrice * totalNights : null;
  const isReserveDisabled = !startDate || !endDate || totalNights < safeMinStay;
  const canReserve = !isReserveDisabled && totalGuests <= safeMaxGuests && !!listingId;
  const canAddGuest = totalGuests < safeMaxGuests;

  const handleReserve = () => {
    if (!session) {
      showToast('Please log in to continue booking.', 'info');
      setIsLoginModalOpen(true);
      return;
    }
    if (!canReserve || !startDate || !endDate || !listingId) return;
    const params = new URLSearchParams({
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd'),
      adults: String(guests.adults),
      children: String(guests.children),
      infants: String(guests.infants),
      pets: String(guests.pets),
    });
    router.push(`/booking/${listingId}?${params.toString()}`);
  };

  return (
    <div className="fixed bottom-0 md:bottom-8 left-0 right-0 z-30 px-0 md:px-4 pointer-events-none flex justify-center">
      <div ref={containerRef} className="w-full max-w-[1050px] pointer-events-auto relative">
        <AnimatePresence>
          {/* Backdrop for mobile popups */}
          {activePopup && (
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActivePopup(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[9999] md:hidden"
            />
          )}

          {/* --- CUSTOM GRID CALENDAR --- */}
          {activePopup === 'calendar' && (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed md:absolute md:bottom-[calc(100%+20px)] bottom-0 left-0 right-0 md:left-1/2 md:-translate-x-1/2 bg-white md:rounded-[40px] rounded-t-[32px] md:rounded-b-[40px] shadow-[0_20px_60px_rgba(0,0,0,0.2)] border-x border-t md:border border-gray-100 p-6 md:p-8 w-full max-w-full md:max-w-[420px] md:w-[420px] z-[10000]"
            >
              <div className="flex justify-between items-center mb-6 md:mb-8 px-2">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                  {calendarSelection === 'checkOut' ? 'Choose check-out date' : 'Choose check-in date'}
                </span>
                <button onClick={() => setActivePopup(null)} className="p-1 border-2 border-black rounded-lg">
                  <X size={14} strokeWidth={3} color='black' />
                </button>
              </div>

              {/* Month Selector */}
              <div className="flex justify-between items-center mb-6 md:mb-8 px-2">
                <button
                  onClick={() => setViewDate(subMonths(viewDate, 1))}
                  className="w-10 h-10 rounded-full border border-gray-200 hover:bg-gray-50 flex items-center justify-center"
                  aria-label="Previous month"
                >
                  <ChevronLeft size={22}  color='black'/>
                </button>
                <span className="text-lg md:text-xl font-bold text-gray-900">{format(viewDate, 'MMMM yyyy')}</span>
                <button
                  onClick={() => setViewDate(addMonths(viewDate, 1))}
                  className="w-10 h-10 rounded-full border border-gray-200 hover:bg-gray-50 flex items-center justify-center"
                  aria-label="Next month"
                >
                  <ChevronRight size={22} color='black' />
                </button>
              </div>

              {safeMinStay > 1 && (
                <div className="px-2 mb-4 text-xs font-semibold text-gray-500">
                  Minimum stay: {safeMinStay} night{safeMinStay > 1 ? 's' : ''}
                </div>
              )}

              {dateError && (
                <div className="px-2 mb-4 text-xs font-semibold text-rose-600">
                  {dateError}
                </div>
              )}

              {/* THE GRID: Guaranteed 7 Columns */}
              <div className="grid grid-cols-7 gap-y-1 md:gap-y-2 text-center text-[13px] md:text-sm">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                  <div key={d} className="text-[11px] font-bold text-gray-400 uppercase mb-4">{d}</div>
                ))}

                {days.map((day, i) => {
                  const isCurrentMonth = isSameMonth(day, viewDate);
                  const isStart = startDate && isSameDay(day, startDate);
                  const isEnd = endDate && isSameDay(day, endDate);
                  const isRange = startDate && endDate && isWithinInterval(day, { start: startDate, end: endDate });
                  const isPast = isBefore(day, startOfDay(new Date()));

                  return (
                    <div key={i} className="relative py-1 flex justify-center items-center">
                      {isRange && !isStart && !isEnd && (
                        <div className="absolute inset-y-1 left-0 right-0 bg-gray-100" />
                      )}
                      <button
                        onClick={() => handleDateClick(day)}
                        disabled={!isCurrentMonth || isPast}
                        className={`
                          relative z-10 w-9 h-9 md:w-11 md:h-11 flex items-center justify-center font-bold rounded-full transition-all
                          ${!isCurrentMonth ? 'text-transparent cursor-default' : isPast ? 'text-gray-300 cursor-not-allowed' : 'text-gray-900 hover:bg-gray-100'}
                          ${(isStart || isEnd) ? 'bg-zinc-900 text-white hover:bg-zinc-900' : ''}
                        `}
                      >
                        {format(day, 'd')}
                      </button>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* --- GUEST POPUP --- */}
          {activePopup === 'guests' && (
            <motion.div
              key="guests"
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed md:absolute md:bottom-[calc(100%+20px)] bottom-0 left-0 right-0 md:left-auto md:right-0 w-full max-w-full md:max-w-[400px] bg-white md:rounded-[40px] rounded-t-[32px] md:rounded-b-[40px] shadow-[0_20px_60px_rgba(0,0,0,0.2)] border-x border-t md:border border-gray-100 p-6 md:p-10 z-[10000]"
            >
              <div className="flex justify-between items-center mb-8 md:mb-10">
                <span className="text-sm text-gray-400 font-bold">Choose guest numbers (up to {safeMaxGuests})</span>
                <button onClick={() => setActivePopup(null)} className="p-1 border-2 border-black rounded-lg"><X size={16} strokeWidth={3} color='black' /></button>
              </div>
              <div className="mb-6 text-xs font-semibold text-gray-500">
                Maximum allowed guests: {safeMaxGuests}
              </div>
              <div className="space-y-6 md:space-y-8">
                <GuestRow
                  label="Adults"
                  sub="Age 13+"
                  value={guests.adults}
                  onInc={() => setGuests({ ...guests, adults: guests.adults + 1 })}
                  onDec={() => setGuests({ ...guests, adults: Math.max(1, guests.adults - 1) })}
                  disableInc={!canAddGuest}
                  disableDec={guests.adults <= 1}
                />
                <GuestRow
                  label="Childrens"
                  sub="Age 2-12"
                  value={guests.children}
                  onInc={() => setGuests({ ...guests, children: guests.children + 1 })}
                  onDec={() => setGuests({ ...guests, children: Math.max(0, guests.children - 1) })}
                  disableInc={!canAddGuest}
                  disableDec={guests.children <= 0}
                />
                <GuestRow label="Infants" sub="Under 2" value={guests.infants} onInc={() => setGuests({ ...guests, infants: guests.infants + 1 })} onDec={() => setGuests({ ...guests, infants: Math.max(0, guests.infants - 1) })} />
                <GuestRow label="Pets" sub="Bringing a service animal?" value={guests.pets} onInc={() => setGuests({ ...guests, pets: guests.pets + 1 })} onDec={() => setGuests({ ...guests, pets: Math.max(0, guests.pets - 1) })} isPet />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- MAIN BAR --- */}
        <div className={`bg-white md:rounded-full shadow-[0_12px_40px_rgba(0,0,0,0.12)] border-t md:border border-gray-100 p-2 md:pl-12 px-4 flex flex-col md:flex-row items-center justify-between h-auto md:h-[96px] w-full gap-2 md:gap-0 transition-all duration-300 ${isLoginModalOpen ? 'opacity-40 pointer-events-none filter grayscale-[0.5]' : 'opacity-100'}`}>
          <div className="text-gray-900 font-bold text-base md:text-lg flex-1 md:block hidden">
            {nightlyPrice ? (
              <div className="flex flex-col">
                <span>${nightlyPrice} / night</span>
                <span className="text-xs font-semibold text-gray-500">Minimum stay: {safeMinStay} night{safeMinStay > 1 ? 's' : ''}</span>
              </div>
            ) : (
              'Add dates for prices'
            )}
          </div>

          {/* Mobile Pricing View */}
          <div className="flex md:hidden w-full items-center justify-between px-6 pt-2 pb-0.5">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-gray-900">
                {nightlyPrice ? `$${nightlyPrice} / night` : 'Add dates for prices'}
              </span>
              <div className="flex items-center gap-1">
                <Star size={10} className="text-green-600 fill-green-600" />
                <span className="text-[10px] font-bold">5.0</span>
                <span className="text-[10px] text-gray-400">· Min {safeMinStay} night{safeMinStay > 1 ? 's' : ''}</span>
              </div>
            </div>
            <button onClick={() => openCalendar('checkIn')} className="text-xs font-bold underline decoration-zinc-300 underline-offset-4">Change dates</button>
          </div>

          <div className="flex flex-1 md:flex-none items-center py-2 w-[94%] md:w-auto h-14 md:h-full border border-gray-100 rounded-2xl md:rounded-[30px] bg-white overflow-hidden shadow-sm md:shadow-none">
            <button onClick={() => openCalendar('checkIn')} className="flex flex-col flex-1 px-4 md:px-10 text-left hover:bg-gray-50 h-full justify-center border-r border-gray-100 min-w-0 md:min-w-[170px]">
              <span className="text-[8px] md:text-[10px] uppercase font-extrabold text-gray-400 mb-0.5 md:mb-1">Check-In</span>
              <span className="text-xs md:text-[15px] font-bold text-gray-900 tracking-tight whitespace-nowrap">
                {startDate ? format(startDate as Date, 'dd/MM/yy') : "Pick date"}
              </span>
            </button>
            <button onClick={() => openCalendar('checkOut')} className="flex flex-col flex-1 px-4 md:px-10 text-left hover:bg-gray-50 h-full justify-center border-r border-gray-100 min-w-0 md:min-w-[170px]">
              <span className="text-[8px] md:text-[10px] uppercase font-extrabold text-gray-400 mb-0.5 md:mb-1">Check-Out</span>
              <span className="text-xs md:text-[15px] font-bold text-gray-900 tracking-tight whitespace-nowrap">
                {endDate ? format(endDate as Date, 'dd/MM/yy') : "Pick date"}
              </span>
            </button>
            <button onClick={() => setActivePopup('guests')} className="flex items-center justify-between flex-1 md:flex-none px-4 md:px-10 text-left hover:bg-gray-50 h-full min-w-0 md:min-w-[220px]">
              <div className="flex flex-col">
                <span className="text-[8px] md:text-[10px] uppercase font-extrabold text-gray-400 mb-0.5 md:mb-1">Guests</span>
                <span className="text-xs md:text-[15px] font-bold text-gray-900 tracking-tight">{totalGuests} guest{totalGuests !== 1 ? 's' : ''}</span>
              </div>
              <ChevronDown size={14} className={`ml-2 md:ml-4 transition-transform ${activePopup === 'guests' ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <div className="w-[94%] md:w-auto md:ml-5 pb-2 md:pb-0">
            <button
              onClick={handleReserve}
              disabled={!canReserve}
              className={`bg-[#EE4B90] hover:bg-[#D63D76] text-white w-full md:w-auto px-10 md:px-14 py-3.5 md:h-[64px] rounded-2xl md:rounded-[30px] font-bold text-sm md:text-lg active:scale-[0.98] shadow-lg shadow-pink-100 flex items-center justify-center transition-all ${!canReserve ? 'opacity-50 cursor-not-allowed hover:bg-[#EE4B90]' : ''}`}
            >
              {totalPrice ? `Reserve · $${totalPrice}` : 'Reserve'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

type GuestRowProps = {
  label: string;
  sub: string;
  value: number;
  onDec: () => void;
  onInc: () => void;
  isPet?: boolean;
  disableDec?: boolean;
  disableInc?: boolean;
};

// Row Sub-component
const GuestRow = ({ label, sub, value, onDec, onInc, isPet, disableDec = false, disableInc = false }: GuestRowProps) => (
  <div className="flex justify-between items-center">
    <div className="flex flex-col">
      <span className="font-bold text-gray-900 text-lg leading-none">{label}</span>
      <span className={`text-[13px] mt-1.5 font-medium ${isPet ? 'text-[#E94E89] underline cursor-pointer' : 'text-gray-400'}`}>{sub}</span>
    </div>
    <div className="flex items-center gap-6">
      <button onClick={onDec} disabled={disableDec} className={`w-10 h-10 text-gray-900 rounded-full border-2 border-gray-100 flex items-center justify-center transition-all ${disableDec ? 'opacity-40 cursor-not-allowed' : 'hover:border-gray-900 hover:text-gray-900'}`}><Minus size={18} strokeWidth={3} /></button>
      <span className="w-4 text-center text-gray-900 font-bold text-lg">{value}</span>
      <button onClick={onInc} disabled={disableInc} className={`w-10 h-10 text-gray-900 rounded-full border-2 border-gray-100 flex items-center justify-center transition-all ${disableInc ? 'opacity-40 cursor-not-allowed' : 'hover:border-gray-900 hover:text-gray-900'}`}><Plus size={18} strokeWidth={3} /></button>
    </div>
  </div>
);

export default BookingBar;
