
import React, { useState } from 'react';
import { EmergencyContact } from '../../../types';
import { PhoneIcon } from '../../icons/PhoneIcon';
import { MedicalCrossIcon } from '../../icons/MedicalCrossIcon';
import { StethoscopeIcon } from '../../icons/StethoscopeIcon';
import AddEditEmergencyContactModal from './AddEditEmergencyContactModal';
import { PlusIcon } from '../../icons/PlusIcon';
import { EditIcon } from '../../icons/EditIcon';
import { TrashIcon } from '../../icons/TrashIcon';
import ConfirmationModal from '../../ConfirmationModal';

const staticContacts = [
    {
        name: 'Ambulance Services',
        number: '108',
        icon: <StethoscopeIcon className="w-7 h-7 text-red-500" />,
    },
    {
        name: 'Medical Helpline',
        number: '102',
        icon: <MedicalCrossIcon className="w-7 h-7 text-red-600" />,
    },
];

const StaticContactCard: React.FC<{ contact: typeof staticContacts[0] }> = ({ contact }) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 dark:bg-gray-700 rounded-lg">
                {contact.icon}
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{contact.name}</h3>
        </div>
        <a href={`tel:${contact.number}`} className="bg-[#2BED8F] hover:bg-[#1cd17e] transition-colors text-black font-bold py-2 px-4 rounded-lg flex items-center gap-2">
            <PhoneIcon className="w-5 h-5" />
            <span>Call {contact.number}</span>
        </a>
    </div>
);

const UserContactCard: React.FC<{ contact: EmergencyContact, onEdit: (contact: EmergencyContact) => void, onInitiateDelete: (contact: EmergencyContact) => void }> = ({ contact, onEdit, onInitiateDelete }) => {
    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <div>
                <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">{contact.name}</h3>
                <p className="text-gray-600 dark:text-gray-300">{contact.relationship}</p>
                 <a href={`tel:${contact.phoneNumber}`} className="text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-2 mt-2">
                    <PhoneIcon className="w-4 h-4" />
                    <span>{contact.phoneNumber}</span>
                </a>
            </div>
            <div className="flex items-center gap-1">
                <a href={`tel:${contact.phoneNumber}`} className="bg-[#2BED8F] hover:bg-[#1cd17e] transition-colors text-black font-bold py-2 px-3 rounded-lg flex items-center gap-2">
                    <PhoneIcon className="w-5 h-5" />
                </a>
                <button onClick={() => onEdit(contact)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-100 dark:hover:bg-gray-700 rounded-full transition-colors" aria-label={`Edit ${contact.name}`}>
                    <EditIcon className="w-5 h-5" />
                </button>
                <button onClick={() => onInitiateDelete(contact)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-gray-700 rounded-full transition-colors" aria-label={`Delete ${contact.name}`}>
                    <TrashIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

interface EmergencyContactsScreenProps {
    onBack: () => void;
    contacts: EmergencyContact[];
    addContact: (contact: Omit<EmergencyContact, 'id'>) => void;
    updateContact: (contact: EmergencyContact) => void;
    deleteContact: (id: string) => void;
}

const EmergencyContactsScreen: React.FC<EmergencyContactsScreenProps> = ({ onBack, contacts, addContact, updateContact, deleteContact }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [contactToEdit, setContactToEdit] = useState<EmergencyContact | null>(null);
    const [contactToDelete, setContactToDelete] = useState<EmergencyContact | null>(null);

    const handleEdit = (contact: EmergencyContact) => {
        setContactToEdit(contact);
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setContactToEdit(null);
        setIsModalOpen(true);
    };

    const handleSave = (contactData: Omit<EmergencyContact, 'id'> | EmergencyContact) => {
        if ('id' in contactData) {
            updateContact(contactData);
        } else {
            addContact(contactData);
        }
    };

    const handleInitiateDelete = (contact: EmergencyContact) => {
        setContactToDelete(contact);
    };

    const handleConfirmDelete = () => {
        if (contactToDelete) {
            deleteContact(contactToDelete.id);
            setContactToDelete(null);
        }
    };

    return (
        <div className="max-w-md mx-auto bg-gray-50 dark:bg-gray-900 min-h-screen">
            <header className="bg-gray-50 dark:bg-gray-900 p-4 flex justify-between items-center sticky top-0 z-10 w-full border-b border-gray-200 dark:border-gray-700">
                <button onClick={onBack} className="text-gray-800 dark:text-gray-200 p-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Emergency Contacts</h1>
                <button onClick={handleAddNew} className="text-blue-600 dark:text-blue-400 p-2" aria-label="Add New Contact">
                    <PlusIcon className="w-7 h-7" />
                </button>
            </header>

            <div className="p-4 space-y-4">
                <p className="text-center text-gray-600 dark:text-gray-300 bg-yellow-100 dark:bg-yellow-900/50 border border-yellow-300 dark:border-yellow-700 p-3 rounded-lg">
                    Tap the 'Call' button to connect immediately.
                </p>
                
                {staticContacts.map(contact => (
                    <StaticContactCard key={contact.name} contact={contact} />
                ))}

                <div className="pt-4">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">Your Personal Contacts</h2>
                     {contacts.length > 0 ? (
                        <div className="space-y-3">
                            {contacts.map(contact => (
                                <UserContactCard key={contact.id} contact={contact} onEdit={handleEdit} onInitiateDelete={handleInitiateDelete} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 px-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                            <p className="text-gray-500 dark:text-gray-400">No personal contacts added yet.</p>
                            <p className="text-gray-500 dark:text-gray-400">Tap the '+' icon to add a contact.</p>
                        </div>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <AddEditEmergencyContactModal
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    contactToEdit={contactToEdit}
                />
            )}
            <ConfirmationModal
                isOpen={!!contactToDelete}
                onClose={() => setContactToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="Delete Contact"
                message={`Are you sure you want to delete ${contactToDelete?.name}?`}
            />
        </div>
    );
};

export default EmergencyContactsScreen;
