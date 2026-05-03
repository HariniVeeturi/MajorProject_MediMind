
import React, { useState, useEffect } from 'react';
import { Appointment } from '../types';

interface AddEditAppointmentModalProps {
    onClose: () => void;
    onSave: (appointment: Omit<Appointment, 'id'> | Appointment) => void;
    appointmentToEdit: Appointment | null;
}

const AddEditAppointmentModal: React.FC<AddEditAppointmentModalProps> = ({ onClose, onSave, appointmentToEdit }) => {
    const [title, setTitle] = useState('');
    const [doctor, setDoctor] = useState('');
    const [location, setLocation] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [notes, setNotes] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (appointmentToEdit) {
            setTitle(appointmentToEdit.title);
            setDoctor(appointmentToEdit.doctor);
            setLocation(appointmentToEdit.location);
            setDate(appointmentToEdit.date);
            setTime(appointmentToEdit.time);
            setNotes(appointmentToEdit.notes || '');
        }
    }, [appointmentToEdit]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !doctor || !location || !date || !time) {
            setError('Please fill out all required fields.');
            return;
        }
        
        const appointmentData = { title, doctor, location, date, time, notes };

        if (appointmentToEdit) {
            onSave({ ...appointmentToEdit, ...appointmentData });
        } else {
            onSave(appointmentData);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">
                    {appointmentToEdit ? 'Edit Appointment' : 'Add New Appointment'}
                </h2>
                
                {error && <p className="text-center text-red-500 my-2">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" placeholder="Visit Purpose (e.g., Annual Check-up)" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white" aria-label="Appointment Title" />
                    <input type="text" placeholder="Doctor's Name" value={doctor} onChange={e => setDoctor(e.target.value)} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white" aria-label="Doctor's Name" />
                    <input type="text" placeholder="Location / Clinic Address" value={location} onChange={e => setLocation(e.target.value)} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white" aria-label="Location" />
                    <div className="flex gap-4">
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white" aria-label="Date" />
                        <input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white" aria-label="Time" />
                    </div>
                    <textarea placeholder="Notes (optional)" value={notes} onChange={e => setNotes(e.target.value)} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white" aria-label="Notes"></textarea>

                    <div className="flex gap-4 pt-2">
                        <button type="button" onClick={onClose} className="w-full bg-gray-200 text-gray-800 font-semibold py-3 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-500 transition">Cancel</button>
                        <button type="submit" className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition">Save Appointment</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddEditAppointmentModal;
