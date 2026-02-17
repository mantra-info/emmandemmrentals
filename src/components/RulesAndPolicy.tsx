import React, { useMemo, useState } from 'react';
import { XCircle, FileText, ShieldCheck, X, Clock3, Users, Ban, Siren } from 'lucide-react';
import { addDays, addHours, format } from 'date-fns';

type ModalType = 'cancellation' | 'house' | 'safety' | null;

interface Policy {
  key: Exclude<ModalType, null>;
  title: string;
  icon: React.ReactNode;
  summary: React.ReactNode;
}

interface ImportantThingsToKnowProps {
  rules?: string[];
  cancellationPolicy?: string | null;
  checkInTime?: string | null;
  checkOutTime?: string | null;
  maxGuests?: number | null;
  selectedCheckInDate?: Date | null;
}

const ImportantThingsToKnow = ({
  rules = [],
  cancellationPolicy = null,
  checkInTime = '5:00 PM',
  checkOutTime = '10:00 AM',
  maxGuests = 8,
  selectedCheckInDate = null,
}: ImportantThingsToKnowProps) => {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [bookingTime] = useState<Date>(() => new Date());

  const cancellationText = useMemo(() => {
    if (!cancellationPolicy?.trim()) {
      return 'Free cancellation within 24 hours of booking (when booked at least 7 days before check-in), then standard policy windows apply.';
    }
    return cancellationPolicy.trim();
  }, [cancellationPolicy]);

  const policyWindows = useMemo(() => {
    return {
      fullRefundUntil: addHours(bookingTime, 24),
      partialRefundUntil: addDays(bookingTime, 15),
      timezoneNote: 'Time shown is based on the listing location timezone.',
    };
  }, [bookingTime]);

  const policies: Policy[] = [
    {
      key: 'cancellation',
      title: 'Cancellation policy',
      icon: <XCircle className="text-[#004D4D]" size={32} strokeWidth={1.5} />,
      summary: 'Add your trip dates to get the cancellation details for this stay.',
    },
    {
      key: 'house',
      title: 'House rules',
      icon: <FileText className="text-[#004D4D]" size={32} strokeWidth={1.5} />,
      summary: (
        <>
          Check-in after {checkInTime}. Checkout before {checkOutTime}. {maxGuests} guests maximum.
        </>
      ),
    },
    {
      key: 'safety',
      title: 'Safety & property',
      icon: <ShieldCheck className="text-[#004D4D]" size={32} strokeWidth={1.5} />,
      summary: 'Important safety details and property devices are listed before you reserve.',
    },
  ];

  return (
    <>
      <section className="py-8 max-w-7xl mx-auto px-6 border-t border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 mb-10">Important Things to Know</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {policies.map((policy) => (
            <div key={policy.key} className="flex gap-6 items-start">
              <div className="shrink-0 mt-1">{policy.icon}</div>
              <div className="flex flex-col gap-2">
                <h3 className="text-md font-bold text-gray-900">{policy.title}</h3>
                <p className="text-[15px] text-gray-500 leading-relaxed">{policy.summary}</p>
                <button
                  type="button"
                  onClick={() => setActiveModal(policy.key)}
                  className="text-left text-sm font-semibold underline text-gray-900 mt-1"
                >
                  Learn more
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/45 p-0 md:p-4">
          <div className={`w-full bg-white rounded-t-3xl max-h-[88vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden shadow-[0_18px_60px_rgba(0,0,0,0.18)] ${
            activeModal === 'cancellation'
              ? 'md:max-w-[1040px] md:rounded-[2.5rem] p-6 md:p-10'
              : 'md:max-w-5xl md:rounded-3xl p-5 md:p-8'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`${activeModal === 'cancellation' ? 'text-lg md:text-lg font-bold' : 'text-lg md:text-lg font-bold'} text-gray-900`}>
                {activeModal === 'cancellation' ? 'Cancellation policy' : activeModal === 'house' ? 'House rules' : 'Safety & property'}
              </h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-2 text-gray-700 hover:bg-gray-50 rounded-full transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {activeModal === 'cancellation' && (
              <div className="space-y-8 md:space-y-9">
                {policyWindows && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-[220px,1fr] gap-5 border-b border-gray-200 pb-8 md:pb-10">
                      <div className="text-gray-900">
                        <p className="font-semibold leading-tight">Before</p>
                        <p className="font-normal mt-3 leading-tight">{format(policyWindows.fullRefundUntil, 'd MMM')}</p>
                        <p className="font-normal mt-1 leading-tight lowercase">{format(policyWindows.fullRefundUntil, 'h:mm a')}</p>
                      </div>
                      <div>
                        <p className=" leading-tight font-semibold text-gray-900">Full refund</p>
                        <p className=" leading-[1.1] font-normal text-gray-900 mt-2">Get back 100% of what you paid.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-[220px,1fr] gap-5 border-b border-gray-200 pb-8 md:pb-10">
                      <div className="text-gray-900">
                        <p className=" font-semibold leading-tight">Before</p>
                        <p className="font-normal mt-3 leading-tight">{format(policyWindows.partialRefundUntil, 'd MMM')}</p>
                        <p className="font-normal mt-1 leading-tight lowercase">{format(policyWindows.partialRefundUntil, 'h:mm a')}</p>
                      </div>
                      <div>
                        <p className=" leading-tight font-semibold text-gray-900">Partial refund</p>
                        <p className=" leading-[1.1] font-normal text-gray-900 mt-2">
                          Get back 50% of every night after the first one. Service fees may be non-refundable.
                        </p>
                      </div>
                    </div>

                    <div className="border-b border-gray-200 pb-8 md:pb-10">
                      <p className="leading-[1.12] font-normal text-gray-900">
                        Time shown is based on the location of the listing.
                      </p>
                    </div>
                  </>
                )}

                <div>
                  <p className="leading-tight font-semibold text-gray-900 mb-3">Refund eligibility</p>
                  <p className="leading-[1.12] font-normal text-gray-900">
                    If you&apos;re making <span className="underline font-medium">scheduled payments</span>, your refund or amount due will
                    depend on how much you&apos;ve paid at the time of cancellation.
                  </p>
                  <button
                    type="button"
                    className="mt-7 leading-tight underline text-gray-500 hover:text-gray-700"
                  >
                    How to find any cancellation policy
                  </button>
                </div>
              </div>
            )}

            {activeModal === 'house' && (
              <div className="space-y-8">
                <p className="text-lg text-gray-700">You'll be staying in someone's home, so please treat it with care and respect.</p>

                <div className='text-black'>
                  <h4 className="text-xl font-black text-gray-900 mb-4">Checking in and out</h4>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-md border-b border-gray-200 pb-4">
                      <Clock3 size={24} />
                      <span>Check-in after {checkInTime}</span>
                    </div>
                    <div className="flex items-center gap-3 text-md border-b border-gray-200 pb-4">
                      <Clock3 size={24} />
                      <span>Checkout before {checkOutTime}</span>
                    </div>
                  </div>
                </div>

                <div className='text-black'>
                  <h4 className="text-xl font-black text-gray-900 mb-4">During your stay</h4>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-md border-b border-gray-200 pb-4">
                      <Users size={24} />
                      <span>{maxGuests} guests maximum</span>
                    </div>
                    {rules.length === 0 && (
                      <div className="flex items-center gap-3 text-md border-b border-gray-200 pb-4">
                        <Ban size={24} />
                        <span>No additional house rules listed</span>
                      </div>
                    )}
                    {rules.map((rule, idx) => (
                      <div key={`${rule}-${idx}`} className="flex items-center gap-3 text-md border-b border-gray-200 pb-4">
                        <Ban size={24} />
                        <span>{rule}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeModal === 'safety' && (
              <div className="space-y-8">
                <p className="text-lg text-gray-700">Avoid surprises by looking over these important safety details about your host's property.</p>

                <div>
                  <h4 className="text-xl font-black text-gray-900 mb-4">Safety devices</h4>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 text-md border-b border-gray-200 pb-4">
                      <Siren size={24} className="mt-1" />
                      <div>
                        <p className="font-semibold text-gray-900">Carbon monoxide alarm</p>
                        <p className="text-sm text-gray-600">Host-reported device status shown in listing details.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 text-md border-b border-gray-200 pb-4">
                      <Siren size={24} className="mt-1" />
                      <div>
                        <p className="font-semibold text-gray-900">Smoke alarm</p>
                        <p className="text-sm text-gray-600">Host-reported device status shown in listing details.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ImportantThingsToKnow;
