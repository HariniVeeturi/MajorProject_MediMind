
import React, { useState } from 'react';
import { Appointment } from '../../types';
import { CalendarIcon } from '../icons/CalendarIcon';
import { PlusIcon } from '../icons/PlusIcon';
import { EditIcon } from '../icons/EditIcon';
import { TrashIcon } from '../icons/TrashIcon';
import AddEditAppointmentModal from '../AddEditAppointmentModal';
import { ClockIcon } from '../icons/ClockIcon';
import ConfirmationModal from '../ConfirmationModal';

interface AppointmentScreenProps {
    appointments: Appointment[];
    onBack: () => void;
    addAppointment: (appointment: Omit<Appointment, 'id'>) => void;
    updateAppointment: (appointment: Appointment) => void;
    deleteAppointment: (id: string) => void;
}

const AppointmentCard: React.FC<{ appt: Appointment, onEdit: (appt: Appointment) => void, onInitiateDelete: (appt: Appointment) => void }> = ({ appt, onEdit, onInitiateDelete }) => {
    const appointmentDate = new Date(`${appt.date}T00:00:00`);
    
    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center justify-center bg-blue-100 dark:bg-gray-700 text-blue-600 dark:text-blue-300 p-3 rounded-lg">
                        <span className="text-xs font-bold uppercase">{appointmentDate.toLocaleString('default', { month: 'short' })}</span>
                        <span className="text-2xl font-bold">{appointmentDate.getDate()}</span>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">{appt.title}</h3>
                        <p className="text-gray-600 dark:text-gray-300 font-medium">{appt.doctor}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{appt.location}</p>
                        <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 mt-2">
                            <ClockIcon className="w-4 h-4"/>
                            <span>{appt.time}</span>
                        </div>
                    </div>
                </div>
                 <div className="flex items-center gap-2">
                    <button onClick={() => onEdit(appt)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-100 dark:hover:bg-gray-700 rounded-full transition-colors" aria-label={`Edit ${appt.title}`}>
                        <EditIcon className="w-5 h-5" />
                    </button>
                    <button onClick={() => onInitiateDelete(appt)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-gray-700 rounded-full transition-colors" aria-label={`Delete ${appt.title}`}>
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
            {appt.notes && (
                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-300"><span className="font-semibold">Notes:</span> {appt.notes}</p>
                </div>
            )}
        </div>
    );
};

const AppointmentScreen: React.FC<AppointmentScreenProps> = ({ appointments, onBack, addAppointment, updateAppointment, deleteAppointment }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [appointmentToEdit, setAppointmentToEdit] = useState<Appointment | null>(null);
    const [appointmentToDelete, setAppointmentToDelete] = useState<Appointment | null>(null);

    const handleEdit = (appt: Appointment) => {
        setAppointmentToEdit(appt);
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setAppointmentToEdit(null);
        setIsModalOpen(true);
    };

    const handleSave = (appt: Omit<Appointment, 'id'> | Appointment) => {
        if ('id' in appt) {
            updateAppointment(appt);
        } else {
            addAppointment(appt);
        }
    };
    
    const handleInitiateDelete = (appt: Appointment) => {
        setAppointmentToDelete(appt);
    };

    const handleConfirmDelete = () => {
        if (appointmentToDelete) {
            deleteAppointment(appointmentToDelete.id);
            setAppointmentToDelete(null);
        }
    };

    const sortedAppointments = [...appointments].sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());

    return (
        <div className="max-w-md mx-auto bg-gray-50 dark:bg-gray-900 min-h-screen">
            <header className="bg-gray-50 dark:bg-gray-900 p-4 flex justify-between items-center sticky top-0 z-10 w-full border-b border-gray-200 dark:border-gray-700">
                 <button onClick={onBack} className="text-gray-800 dark:text-gray-200 p-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <div className="text-center">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Appointments</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Manage your doctor visits</p>
                </div>
                <button onClick={handleAddNew} className="text-blue-600 dark:text-blue-400 p-2" aria-label="Add New Appointment">
                    <PlusIcon className="w-7 h-7" />
                </button>
            </header>
            
            <div className="p-4 space-y-4">
                {sortedAppointments.length > 0 ? (
                    sortedAppointments.map(appt => <AppointmentCard key={appt.id} appt={appt} onEdit={handleEdit} onInitiateDelete={handleInitiateDelete} />)
                ) : (
                    <div className="text-center py-20 px-4">
                        <CalendarIcon className="w-16 h-16 mx-auto text-gray-400" />
                        <h3 className="mt-4 text-xl font-semibold text-gray-800 dark:text-gray-200">No Upcoming Appointments</h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">Tap the '+' icon to schedule a new visit.</p>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <AddEditAppointmentModal
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    appointmentToEdit={appointmentToEdit}
                />
            )}

            <ConfirmationModal
                isOpen={!!appointmentToDelete}
                onClose={() => setAppointmentToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="Delete Appointment"
                message={`Are you sure you want to delete the appointment for "${appointmentToDelete?.title}"?`}
            />
        </div>
    );
};

export default AppointmentScreen;
