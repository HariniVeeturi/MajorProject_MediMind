
import React from 'react';
import { MailIcon } from '../../icons/MailIcon';
import { PhoneIcon } from '../../icons/PhoneIcon';
import { ChatIcon } from '../../icons/ChatIcon';

const FAQItem: React.FC<{ question: string }> = ({ question }) => (
    <details className="group border-b border-gray-200 dark:border-gray-700 last:border-b-0">
        <summary className="flex justify-between items-center font-semibold cursor-pointer py-5 text-base text-gray-800 dark:text-gray-100">
            {question}
            <svg className="w-5 h-5 text-gray-500 transform transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7-7 7-7" />
            </svg>
        </summary>
        <p className="pt-1 pb-4 text-gray-600 dark:text-gray-300">
            This is a placeholder answer. Functionality for this will be added in a future update.
        </p>
    </details>
);

const ContactCard: React.FC<{ 
    icon: React.ReactNode; 
    title: string; 
    subtitle: string; 
    href?: string;
    onClick?: () => void;
    isPrimary?: boolean;
}> = ({ icon, title, subtitle, href, onClick, isPrimary = false }) => {
    const baseClasses = "group block w-full text-left p-4 rounded-xl shadow-sm border flex items-center gap-4 transition-transform transform hover:-translate-y-1 hover:shadow-md duration-300";
    
    const primaryClasses = "bg-cyan-500 text-white border-transparent hover:bg-cyan-600";
    const defaultClasses = "bg-white dark:bg-gray-800 text-gray-800 border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-cyan-500 active:border-transparent";
    
    const iconDefaultWrapperClasses = "bg-blue-100 dark:bg-gray-700 group-active:bg-cyan-400 transition-colors";
    
    const iconPrimaryClasses = "text-cyan-100";
    const iconDefaultClasses = "text-blue-600 dark:text-blue-400 group-active:text-white transition-colors";

    const content = (
        <>
            <div className={`p-3 rounded-lg ${!isPrimary ? iconDefaultWrapperClasses : ''}`}>
                {React.cloneElement(icon as React.ReactElement<any>, { className: `w-6 h-6 ${isPrimary ? iconPrimaryClasses : iconDefaultClasses}` })}
            </div>
            <div>
                <h3 className={`font-bold ${isPrimary ? 'text-white' : 'text-gray-800 dark:text-gray-100 group-active:text-white'} transition-colors`}>{title}</h3>
                <p className={`${isPrimary ? 'text-cyan-200' : 'text-gray-500 dark:text-gray-400 group-active:text-cyan-200'} transition-colors`}>{subtitle}</p>
            </div>
        </>
    );

    if (href) {
        return (
            <a href={href} className={`${baseClasses} ${isPrimary ? primaryClasses : defaultClasses}`}>
                {content}
            </a>
        );
    }
    
    return (
        <button onClick={onClick} className={`${baseClasses} ${isPrimary ? primaryClasses : defaultClasses}`}>
            {content}
        </button>
    );
};

const HelpSupportScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    return (
        <div className="max-w-md mx-auto bg-gray-50 dark:bg-gray-900 min-h-screen">
             <header className="bg-gray-50 dark:bg-gray-900 p-4 flex justify-between items-center sticky top-0 z-10 w-full border-b border-gray-200 dark:border-gray-700">
                <button onClick={onBack} className="text-gray-800 dark:text-gray-200 p-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Help & Support</h1>
                <div className="w-8"></div>
            </header>

            <div className="p-4 space-y-6">
                 <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">Frequently Asked Questions</h2>
                    <div>
                        <FAQItem question="How do I add a new medication?" />
                        <FAQItem question="How do I change my notification settings?" />
                        <FAQItem question="How do I add an emergency contact?" />
                        <FAQItem question="Is my health data secure?" />
                        <FAQItem question="How do I track my medication adherence?" />
                        <FAQItem question="Can I share my health data with my doctor?" />
                    </div>
                 </div>

                 <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Contact Support</h2>
                     <div className="space-y-3">
                        <ContactCard
                            icon={<MailIcon />}
                            title="Email Support"
                            subtitle="dsandeepsankar@gmail.com"
                            href="mailto:dsandeepsankar@gmail.com"
                        />
                         <ContactCard
                            icon={<PhoneIcon />}
                            title="Phone Support"
                            subtitle="7207217229"
                            href="tel:7207217229"
                        />
                     </div>
                </div>

                 <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Resources</h2>
                     <div className="space-y-3">
                        <button className="w-full text-left p-4 border border-gray-100 bg-white dark:bg-gray-700/50 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex justify-between items-center transition-transform transform hover:-translate-y-1 hover:shadow-sm duration-200">
                            <span className="font-medium text-gray-700 dark:text-gray-200">User Guide</span> 
                            <span className="text-gray-400">↗</span>
                        </button>
                        <button className="w-full text-left p-4 border border-gray-100 bg-white dark:bg-gray-700/50 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex justify-between items-center transition-transform transform hover:-translate-y-1 hover:shadow-sm duration-200">
                            <span className="font-medium text-gray-700 dark:text-gray-200">Terms of Service</span>
                            <span className="text-gray-400">↗</span>
                        </button>
                        <button className="w-full text-left p-4 border border-gray-100 bg-white dark:bg-gray-700/50 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex justify-between items-center transition-transform transform hover:-translate-y-1 hover:shadow-sm duration-200">
                            <span className="font-medium text-gray-700 dark:text-gray-200">Privacy Policy</span>
                            <span className="text-gray-400">↗</span>
                        </button>
                     </div>
                </div>
            </div>
        </div>
    );
};

export default HelpSupportScreen;
