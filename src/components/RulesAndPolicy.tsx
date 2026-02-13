import React from 'react';
import { XCircle, FileText, ShieldCheck } from 'lucide-react';

interface Policy {
  title: string;
  icon: React.ReactNode;
  description: React.ReactNode;
}

const defaultPolicies: Policy[] = [
  {
    title: 'Cancellation policy',
    icon: <XCircle className="text-[#004D4D]" size={32} strokeWidth={1.5} />,
    description: 'Add your trip dates to get the cancellation details for this stay.',
  },
  {
    title: 'House rules',
    icon: <FileText className="text-[#004D4D]" size={32} strokeWidth={1.5} />,
    description: (
      <>
        Check-in after 5:00 pm<br />
        Checkout before 10:00 am<br />
        8 guests maximum
      </>
    ),
  },
  {
    title: 'Safety & property',
    icon: <ShieldCheck className="text-[#004D4D]" size={32} strokeWidth={1.5} />,
    description: (
      <>
        Carbon monoxide alarm<br />
        Smoke alarm
      </>
    ),
  },
];

interface ImportantThingsToKnowProps {
  rules?: string[];
}

const ImportantThingsToKnow = ({ rules = [] }: ImportantThingsToKnowProps) => {
  // If rules provided, format them for display
  const policies = rules.length > 0
    ? [
        defaultPolicies[0], // Keep cancellation policy default
        {
          title: 'House rules',
          icon: <FileText className="text-[#004D4D]" size={32} strokeWidth={1.5} />,
          description: (
            <>
              {rules.map((rule, idx) => (
                <React.Fragment key={idx}>
                  {rule}{idx < rules.length - 1 ? <br /> : ''}
                </React.Fragment>
              ))}
            </>
          ),
        },
        defaultPolicies[2], // Keep safety policy default
      ]
    : defaultPolicies;
  return (
    <section className="py-8 max-w-7xl mx-auto px-6 border-t border-gray-100">
      <h2 className="text-2xl font-bold text-gray-900 mb-10">
        Important Things to Know
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {policies.map((policy, index) => (
          <div key={index} className="flex gap-6 items-start">
            <div className="shrink-0 mt-1">
              {policy.icon}
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-bold text-gray-900">
                {policy.title}
              </h3>
              <p className="text-[15px] text-gray-500 leading-relaxed">
                {policy.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ImportantThingsToKnow;