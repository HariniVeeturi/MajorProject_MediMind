
import React, { useState, useEffect } from 'react';
import { EmergencyContact } from '../../../types';

interface AddEditEmergencyContactModalProps {
    onClose: () => void;
    onSave: (contact: Omit<EmergencyContact, 'id'> | EmergencyContact) => void;
    contactToEdit: EmergencyContact | null;
}

const relationshipOptions = [
    'Spouse', 'Parent', 'Child', 'Sibling', 'Friend',
    'Neighbor', 'Doctor', 'Caregiver', 'Other'
];

const AddEditEmergencyContactModal: React.FC<AddEditEmergencyContactModalProps> = ({ onClose, onSave, contactToEdit }) => {
    const [name, setName] = useState('');
    const [relationship, setRelationship] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (contactToEdit) {
            setName(contactToEdit.name);
            setRelationship(contactToEdit.relationship);
            setPhoneNumber(contactToEdit.phoneNumber);
        }
    }, [contactToEdit]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !relationship || !phoneNumber) {
            setError('Please fill out all fields.');
            return;
        }
        
        if (contactToEdit) {
            onSave({ ...contactToEdit, name, relationship, phoneNumber });
        } else {
            onSave({ name, relationship, phoneNumber });
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">
                    {contactToEdit ? 'Edit Contact' : 'Add New Contact'}
                </h2>
                
                {error && <p className="text-center text-red-500 my-2">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" aria-label="Full Name" />
                    
                    <select
                        value={relationship}
                        onChange={e => setRelationship(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        aria-label="Relationship"
                    >
                        <option value="" disabled>Select Relationship</option>
                        {relationshipOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>

                    <input type="tel" placeholder="Phone Number" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" aria-label="Phone Number" />

                    <div className="flex gap-4 pt-2">
                        <button type="button" onClick={onClose} className="w-full bg-gray-200 text-gray-800 font-semibold py-3 rounded-lg hover:bg-gray-300 transition dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-500">Cancel</button>
                        <button type="submit" className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition">Save Contact</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddEditEmergencyContactModal;