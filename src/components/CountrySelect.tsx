'use client';

import React from 'react';

export interface Country {
    name: string;
    code: string;
    dialCode: string;
    flag: string;
    phoneLength: number;
}

const countries: Country[] = [
    { name: 'India', code: 'IN', dialCode: '+91', flag: '🇮🇳', phoneLength: 10 },
    { name: 'United States', code: 'US', dialCode: '+1', flag: '🇺🇸', phoneLength: 10 },
    { name: 'United Kingdom', code: 'GB', dialCode: '+44', flag: '🇬🇧', phoneLength: 10 },
    { name: 'Canada', code: 'CA', dialCode: '+1', flag: '🇨🇦', phoneLength: 10 },
    { name: 'Australia', code: 'AU', dialCode: '+61', flag: '🇦🇺', phoneLength: 9 },
    { name: 'Germany', code: 'DE', dialCode: '+49', flag: '🇩🇪', phoneLength: 11 },
    { name: 'France', code: 'FR', dialCode: '+33', flag: '🇫🇷', phoneLength: 9 },
    { name: 'Japan', code: 'JP', dialCode: '+81', flag: '🇯🇵', phoneLength: 10 },
];

interface CountrySelectProps {
    selectedCountry: Country;
    onSelect: (country: Country) => void;
}

const CountrySelect = ({ selectedCountry, onSelect }: CountrySelectProps) => {
    return (
        <div className="relative group">
            <select
                value={selectedCountry.code}
                onChange={(e) => {
                    const country = countries.find(c => c.code === e.target.value);
                    if (country) onSelect(country);
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            >
                {countries.map((country) => (
                    <option key={country.code} value={country.code}>
                        {country.flag} {country.name} ({country.dialCode})
                    </option>
                ))}
            </select>

            <div className="flex items-center gap-1 px-3 py-2 bg-black text-white rounded-md cursor-pointer shrink-0 w-[140px] justify-between">
                <div className="flex flex-col items-start leading-none overflow-hidden">
                    <span className="text-[10px] text-gray-400 mb-0.5">Country/Region</span>
                    <div className="flex items-center font-medium text-sm w-full">
                        <span className="truncate block w-full text-left">
                            {selectedCountry.name} ({selectedCountry.dialCode})
                        </span>
                    </div>
                </div>
                <span className="text-[10px] text-gray-400 shrink-0">▼</span>
            </div>
        </div>
    );
};

export default CountrySelect;
export { countries };
