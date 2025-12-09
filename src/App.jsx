import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock, User, FileText, Activity, Users, Pill, TestTube, LogOut, Heart, Stethoscope, Brain, Eye, Bone, AlertCircle, CheckCircle, Menu, X, Phone, Moon, Sun, Settings, Package, Hospital, Scissors, MessageSquare, BarChart3, Scan } from 'lucide-react';
import { usePatients, useAppointments, useTreatments, useVitalSigns, useNurseNotes, usePatientTransfers, useNonPharmaTreatments } from './hooks/useDatabase';
import { logout as authLogout } from './services/auth';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import AdminDashboard from './components/AdminDashboard';
import DoctorDashboard from './components/DoctorDashboard';
import NotificationCenter from './components/NotificationCenter';
import SearchBar from './components/SearchBar';
import UserProfile from './components/UserProfile';
import ErrorBoundary from './components/ErrorBoundary';
import AppointmentCalendar from './components/AppointmentCalendar';
import PharmacyManagement from './components/PharmacyManagement';
import EmergencyRoom from './components/EmergencyRoom';
import SettingsPage from './components/SettingsPage';
import SurgeryScheduling from './components/SurgeryScheduling';
import MessagingSystem from './components/MessagingSystem';
import ReportsAnalytics from './components/ReportsAnalytics';
import LabManagement from './components/LabManagement';
import RadiologyManagement from './components/RadiologyManagement';
import AdvancedDashboard from './components/AdvancedDashboard';

// Triage helper function - Escala institucional de triaje
const getTriageInfo = (level) => {
  const triageScales = {
    1: { 
      name: 'Rojo - Resucitación',
      color: 'bg-red-600',
      borderColor: 'border-red-600',
      textColor: 'text-red-600',
      bgLight: 'bg-red-50',
      description: 'Emergencia vital inmediata',
      icon: '🔴',
      priority: 'Inmediata'
    },
    2: { 
      name: 'Naranja - Emergencia',
      color: 'bg-orange-500',
      borderColor: 'border-orange-500',
      textColor: 'text-orange-600',
      bgLight: 'bg-orange-50',
      description: 'Emergencia, atención en 10 min',
      icon: '🟠',
      priority: '10 minutos'
    },
    3: { 
      name: 'Amarillo - Urgente',
      color: 'bg-yellow-500',
      borderColor: 'border-yellow-500',
      textColor: 'text-yellow-700',
      bgLight: 'bg-yellow-50',
      description: 'Urgente, atención en 30 min',
      icon: '🟡',
      priority: '30 minutos'
    },
    4: { 
      name: 'Verde - Menos Urgente',
      color: 'bg-green-500',
      borderColor: 'border-green-500',
      textColor: 'text-green-700',
      bgLight: 'bg-green-50',
      description: 'Menos urgente, atención en 60 min',
      icon: '🟢',
      priority: '60 minutos'
    },
    5: { 
      name: 'Azul - No Urgente',
      color: 'bg-blue-500',
      borderColor: 'border-blue-500',
      textColor: 'text-blue-700',
      bgLight: 'bg-blue-50',
      description: 'No urgente, atención en 120 min',
      icon: '🔵',
      priority: '120 minutos'
    }
  };
  
  return triageScales[level] || triageScales[3]; // Default to yellow if not specified
};

const HospitalManagementSystem = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('home');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  // Load dark mode preference
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Handle search results
  const handleSearchResult = (result) => {
    console.log('Search result clicked:', result);
    // Navigate to appropriate view based on result type
    if (result.type === 'patient') {
      setSelectedPatient(result.data);
      if (currentUser?.role === 'nurse') {
        setCurrentView('patients');
      }
    }
  };
  
  // Use database hook for patients instead of mock data
  const { patients, loading: patientsLoading, addPatient, updatePatient, removePatient } = usePatients();
  
  // Use database hook for appointments
  const { appointments, loading: appointmentsLoading, addAppointment: addAppointmentDB } = useAppointments();
  
  // Use database hook for treatments
  const { treatments, loading: treatmentsLoading, addTreatment: addTreatmentDB } = useTreatments();
  
  // Use database hook for vital signs
  const { vitalSigns, loading: vitalSignsLoading, addVitalSigns: addVitalSignsDB } = useVitalSigns();
  
  // Use database hook for nurse notes
  const { nurseNotes, loading: nurseNotesLoading, addNurseNote: addNurseNoteDB } = useNurseNotes();

  // Keep lab tests and medical history as local state for now (can be migrated later)
  const [labTests, setLabTests] = useState([
    { id: 1, patientId: 1, test: 'Hemograma completo', date: '2025-10-28', status: 'Completado', results: 'Normal', orderedBy: 'Dr. Ramírez' },
    { id: 2, patientId: 2, test: 'Resonancia Magnética', date: '2025-10-29', status: 'Pendiente', results: '-', orderedBy: 'Dra. Torres' }
  ]);

  const [medicalHistory, setMedicalHistory] = useState([
    { id: 1, patientId: 1, date: '2025-10-25', diagnosis: 'Hipertensión arterial', treatment: 'Losartán 50mg', notes: 'Paciente con control regular de presión arterial', doctor: 'Dr. Ramírez' },
    { id: 2, patientId: 2, date: '2025-10-27', diagnosis: 'Accidente cerebrovascular', treatment: 'Tratamiento de emergencia', notes: 'Ingreso por urgencias, requiere monitoreo constante', doctor: 'Dra. Torres' }
  ]);

  const [patientTransfers, setPatientTransfers] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const specialties = [
    { name: 'Cardiología', icon: Heart, description: 'Cuidado del corazón y sistema cardiovascular' },
    { name: 'Neurología', icon: Brain, description: 'Tratamiento del sistema nervioso' },
    { name: 'Oftalmología', icon: Eye, description: 'Especialistas en salud visual' },
    { name: 'Traumatología', icon: Bone, description: 'Tratamiento de huesos y articulaciones' },
    { name: 'Medicina General', icon: Stethoscope, description: 'Atención médica integral' }
  ];

  const handleLoginSuccess = async (user) => {
    // Map role to type for backwards compatibility
    setCurrentUser({
      ...user,
      type: user.role === 'nurse' ? 'nurse' : user.role === 'patient' ? 'patient' : 'admin'
    });
    setCurrentView('dashboard');
    
    // Initialize sample nurse data if user is a nurse
    if (user.role === 'nurse') {
      try {
        const { initializeSampleNurseData } = await import('./services/database');
        await initializeSampleNurseData();
      } catch (error) {
        console.error('Error initializing nurse data:', error);
      }
    }
  };

  const handleLogout = () => {
    authLogout();
    setCurrentUser(null);
    setCurrentView('home');
    setSelectedPatient(null);
  };

  const scheduleAppointment = async () => {
    if (newAppointment.patientName && newAppointment.date && newAppointment.time && newAppointment.type) {
      const conflictingAppointment = appointments.find(
        apt => apt.date === newAppointment.date && apt.time === newAppointment.time
      );
      
      if (conflictingAppointment) {
        alert('Ya existe una cita programada para esta fecha y hora. Por favor seleccione otro horario.');
        return;
      }

      try {
        const newApt = {
          patient_id: currentUser.type === 'patient' ? currentUser.id : null,
          patient_name: newAppointment.patientName,
          date: newAppointment.date,
          time: newAppointment.time,
          type: newAppointment.type,
          status: 'Pendiente',
          doctor: 'Por asignar'
        };
        await addAppointmentDB(newApt);
        setNewAppointment({ patientName: '', date: '', time: '', type: '' });
        alert('Cita agendada exitosamente');
      } catch (error) {
        console.error('Error scheduling appointment:', error);
        alert('Error al agendar la cita. Por favor intente nuevamente.');
      }
    } else {
      alert('Por favor complete todos los campos');
    }
  };

  const applyTreatment = async () => {
    if (newTreatment.patientId && newTreatment.medication && newTreatment.dose && newTreatment.frequency) {
      // Usar la hora ingresada o la actual
      const now = new Date();
      const dateStr = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
      
      let applicationTimeStr;
      if (newTreatment.applicationTime) {
        applicationTimeStr = newTreatment.applicationTime;
      } else {
        applicationTimeStr = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
      }
      
      const timestamp = dateStr + ' ' + applicationTimeStr;
      
      try {
        const newTrt = {
          patient_id: parseInt(newTreatment.patientId),
          medication: newTreatment.medication,
          dose: newTreatment.dose,
          frequency: newTreatment.frequency,
          start_date: dateStr,
          applied_by: currentUser.name,
          last_application: timestamp,
          notes: newTreatment.notes
        };
        await addTreatmentDB(newTrt);
        setNewTreatment({ patientId: '', medication: '', dose: '', frequency: '', notes: '', applicationTime: '' });
        alert('💊 Medicamento administrado y registrado exitosamente');
      } catch (error) {
        console.error('Error applying treatment:', error);
        alert('Error al registrar la administración. Por favor intente nuevamente.');
      }
    } else {
      alert('Por favor complete todos los campos obligatorios');
    }
  };

  const applyNonPharmaTreatment = async () => {
    if (newNonPharmaTreatment.patientId && newNonPharmaTreatment.treatmentType && newNonPharmaTreatment.description) {
      try {
        const now = new Date();
        const applicationDate = now.toISOString().split('T')[0];
        
        let applicationTimeStr = now.toTimeString().split(' ')[0].substring(0, 5);
        if (newNonPharmaTreatment.applicationTime) {
          applicationTimeStr = newNonPharmaTreatment.applicationTime;
        }
        
        await addNonPharmaTreatment({
          patient_id: parseInt(newNonPharmaTreatment.patientId),
          treatment_type: newNonPharmaTreatment.treatmentType,
          description: newNonPharmaTreatment.description,
          application_date: applicationDate,
          application_time: applicationTimeStr,
          duration: newNonPharmaTreatment.duration,
          performed_by: currentUser.name,
          materials_used: newNonPharmaTreatment.materialsUsed,
          observations: newNonPharmaTreatment.observations,
          outcome: newNonPharmaTreatment.outcome,
          next_application: newNonPharmaTreatment.nextApplication,
          status: 'Completado'
        });
        
        setNewNonPharmaTreatment({ 
          patientId: '', 
          treatmentType: '', 
          description: '', 
          applicationTime: '', 
          duration: '', 
          materialsUsed: '', 
          observations: '',
          outcome: '',
          nextApplication: ''
        });
        
        alert('✅ Tratamiento no farmacológico registrado exitosamente');
      } catch (error) {
        console.error('Error applying non-pharmacological treatment:', error);
        alert('❌ Error al registrar el tratamiento no farmacológico');
      }
    } else {
      alert('⚠️ Por favor complete los campos requeridos: paciente, tipo de tratamiento y descripción');
    }
  };

  const registerVitalSigns = async () => {
    if (newVitalSigns.patientId && newVitalSigns.temperature && newVitalSigns.bloodPressure && newVitalSigns.heartRate && newVitalSigns.respiratoryRate) {
      // Usar la fecha/hora ingresada o la actual
      let timestamp;
      if (newVitalSigns.dateTime) {
        timestamp = newVitalSigns.dateTime.replace('T', ' ');
      } else {
        const now = new Date();
        timestamp = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0') + ' ' + String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
      }
      
      try {
        const newVS = {
          patient_id: parseInt(newVitalSigns.patientId),
          date: timestamp,
          temperature: newVitalSigns.temperature,
          blood_pressure: newVitalSigns.bloodPressure,
          heart_rate: newVitalSigns.heartRate,
          respiratory_rate: newVitalSigns.respiratoryRate,
          registered_by: currentUser.name
        };
        await addVitalSignsDB(newVS);
        setNewVitalSigns({ patientId: '', temperature: '', bloodPressure: '', heartRate: '', respiratoryRate: '', dateTime: '' });
        alert('✅ Signos vitales registrados exitosamente');
      } catch (error) {
        console.error('Error registering vital signs:', error);
        alert('Error al registrar signos vitales. Por favor intente nuevamente.');
      }
    } else {
      alert('Por favor complete todos los campos obligatorios');
    }
  };

  const addNurseNote = async () => {
    if (newNurseNote.patientId && newNurseNote.note) {
      const now = new Date();
      const timestamp = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0') + ' ' + String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
      
      try {
        const newNote = {
          patient_id: parseInt(newNurseNote.patientId),
          date: timestamp,
          note: newNurseNote.note,
          note_type: newNurseNote.noteType || 'evolutiva',
          nurse_name: currentUser.name
        };
        await addNurseNoteDB(newNote);
        setNewNurseNote({ patientId: '', note: '', noteType: 'evolutiva' });
        
        // Success message based on note type
        const noteTypeNames = {
          'evolutiva': 'Nota Evolutiva',
          'observacion': 'Observación',
          'incidente': 'Reporte de Incidente',
          'mejora': 'Nota de Mejoría',
          'deterioro': 'Alerta de Deterioro'
        };
        alert(`${noteTypeNames[newNurseNote.noteType] || 'Nota'} registrada exitosamente`);
      } catch (error) {
        console.error('Error adding nurse note:', error);
        alert('Error al registrar nota. Por favor intente nuevamente.');
      }
    } else {
      alert('Por favor seleccione un paciente y escriba la nota');
    }
  };

  const viewPatientDetails = (patient) => {
    setSelectedPatient(patient);
    setCurrentView('patientDetails');
  };

  const PatientDetailsView = () => {
    if (!selectedPatient) return null;
    
    const triageInfo = getTriageInfo(selectedPatient.triage_level || 3);
    const patientTreatments = treatments.filter(t => t.patientId === selectedPatient.id);
    const patientHistory = medicalHistory.filter(h => h.patientId === selectedPatient.id);
    const patientLabs = labTests.filter(l => l.patientId === selectedPatient.id);
    const patientAppointments = appointments.filter(a => a.patientId === selectedPatient.id);
    const patientVitals = vitalSigns.filter(v => v.patientId === selectedPatient.id);
    const patientNotes = nurseNotes.filter(n => n.patientId === selectedPatient.id);
    
    // Load patient transfers
    const { transfers: patientTransfersList } = usePatientTransfers(selectedPatient.id);
    
    // Estados para filtros de signos vitales
    const [vitalFilters, setVitalFilters] = React.useState({
      dateFrom: '',
      dateTo: '',
      shift: 'all' // all, morning, afternoon, night
    });
    
    // Función para determinar el turno según la hora
    const getShiftFromTime = (dateString) => {
      const date = new Date(dateString);
      const hour = date.getHours();
      if (hour >= 7 && hour < 15) return 'morning';
      if (hour >= 15 && hour < 23) return 'afternoon';
      return 'night';
    };
    
    // Filtrar signos vitales
    const filteredVitals = patientVitals.filter(vital => {
      const vitalDate = new Date(vital.date);
      
      // Filtro por fecha desde
      if (vitalFilters.dateFrom) {
        const dateFrom = new Date(vitalFilters.dateFrom);
        dateFrom.setHours(0, 0, 0, 0);
        if (vitalDate < dateFrom) return false;
      }
      
      // Filtro por fecha hasta
      if (vitalFilters.dateTo) {
        const dateTo = new Date(vitalFilters.dateTo);
        dateTo.setHours(23, 59, 59, 999);
        if (vitalDate > dateTo) return false;
      }
      
      // Filtro por turno
      if (vitalFilters.shift !== 'all') {
        const vitalShift = getShiftFromTime(vital.date);
        if (vitalShift !== vitalFilters.shift) return false;
      }
      
      return true;
    });
    
    // Limpiar filtros
    const clearVitalFilters = () => {
      setVitalFilters({
        dateFrom: '',
        dateTo: '',
        shift: 'all'
      });
    };

    return (
      <div className="space-y-4 md:space-y-6">
        <button
          onClick={() => setCurrentView('dashboard')}
          className="px-3 md:px-4 py-2 text-sm md:text-base bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
        >
          ← Volver al Dashboard
        </button>

        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md border-l-4 ${triageInfo.borderColor}">
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center">
              <User className="mr-2 text-blue-600" size={24} />
              Información del Paciente
            </h2>
            {/* Triage Badge */}
            <div className={`${triageInfo.bgLight} border-2 ${triageInfo.borderColor} rounded-xl px-4 py-2 text-center`}>
              <div className="text-3xl mb-1">{triageInfo.icon}</div>
              <div className={`text-xs font-bold ${triageInfo.textColor} uppercase`}>
                Triaje: Nivel {selectedPatient.triage_level || 3}
              </div>
              <div className={`text-xs ${triageInfo.textColor} font-semibold mt-1`}>
                ⏱️ {triageInfo.priority}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p className="text-gray-600 text-xs md:text-sm">Nombre</p>
              <p className="font-semibold text-base md:text-lg">{selectedPatient.name}</p>
            </div>
            <div>
              <p className="text-gray-600 text-xs md:text-sm">Edad</p>
              <p className="font-semibold text-base md:text-lg">{selectedPatient.age} años</p>
            </div>
            <div>
              <p className="text-gray-600 text-xs md:text-sm">Tipo de Sangre</p>
              <p className="font-semibold text-base md:text-lg">{selectedPatient.bloodType}</p>
            </div>
            <div>
              <p className="text-gray-600 text-xs md:text-sm">Alergias</p>
              <p className="font-semibold text-base md:text-lg">{selectedPatient.allergies}</p>
            </div>
            <div>
              <p className="text-gray-600 text-xs md:text-sm">Condición</p>
              <span className={'px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-semibold ' + (selectedPatient.condition === 'Crítico' ? 'bg-red-100 text-red-800' : selectedPatient.condition === 'Estable' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800')}>
                {selectedPatient.condition}
              </span>
            </div>
            <div>
              <p className="text-gray-600 text-xs md:text-sm">Fecha de Ingreso</p>
              <p className="font-semibold text-base md:text-lg">{selectedPatient.admissionDate}</p>
            </div>
          </div>
        </div>

        {/* Ubicación Actual del Paciente */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-6 rounded-lg shadow-md border-2 border-blue-200">
          <div className="flex items-center mb-4">
            <div className="bg-blue-500 p-3 rounded-full mr-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-blue-900">Ubicación Actual</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100">
              <p className="text-xs text-blue-600 font-semibold mb-1 flex items-center">
                <span className="text-lg mr-1">🏢</span> PISO
              </p>
              <p className="text-2xl font-bold text-blue-900">{selectedPatient.floor || '1'}</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100">
              <p className="text-xs text-blue-600 font-semibold mb-1 flex items-center">
                <span className="text-lg mr-1">🏥</span> ÁREA
              </p>
              <p className="text-lg font-bold text-blue-900">{selectedPatient.area || 'General'}</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100">
              <p className="text-xs text-blue-600 font-semibold mb-1 flex items-center">
                <span className="text-lg mr-1">🚪</span> HABITACIÓN
              </p>
              <p className="text-2xl font-bold text-blue-900">{selectedPatient.room}</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100">
              <p className="text-xs text-blue-600 font-semibold mb-1 flex items-center">
                <span className="text-lg mr-1">🛏️</span> CAMA
              </p>
              <p className="text-2xl font-bold text-blue-900">{selectedPatient.bed || 'A'}</p>
            </div>
          </div>
          
          <div className="mt-4 bg-blue-100 border border-blue-200 rounded-lg p-3">
            <p className="text-sm font-semibold text-blue-900">
              📍 Ubicación Completa: Piso {selectedPatient.floor || '1'} • {selectedPatient.area || 'General'} • Hab. {selectedPatient.room} • Cama {selectedPatient.bed || 'A'}
            </p>
          </div>
        </div>

        {/* Historial de Traslados */}
        {patientTransfersList && patientTransfersList.length > 0 && (
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg md:text-xl font-bold flex items-center">
                <svg className="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                Historial de Traslados
              </h3>
              <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">
                {patientTransfersList.length} {patientTransfersList.length === 1 ? 'traslado' : 'traslados'}
              </span>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {patientTransfersList.map((transfer, index) => {
                const transferDate = new Date(transfer.transferDate + ' ' + transfer.transferTime);
                const isRecent = (Date.now() - transferDate.getTime()) < 86400000; // Últimas 24 horas
                
                return (
                  <div key={transfer.id || index} className="border-l-4 border-orange-300 bg-orange-50 rounded-xl p-4 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                        <span className="font-bold text-gray-800 text-sm">
                          📅 {transferDate.toLocaleDateString('es-ES', { 
                            day: 'numeric', 
                            month: 'long', 
                            year: 'numeric' 
                          })}
                        </span>
                        {isRecent && (
                          <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full font-semibold">
                            RECIENTE
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-bold text-orange-700">
                        🕐 {transfer.transferTime}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      {/* Ubicación Anterior */}
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-xs font-semibold text-red-700 mb-2 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Ubicación Anterior
                        </p>
                        <div className="space-y-1 text-sm">
                          <p>🏢 Piso: <span className="font-semibold">{transfer.fromFloor || '-'}</span></p>
                          <p>🏥 Área: <span className="font-semibold">{transfer.fromArea || '-'}</span></p>
                          <p>🚪 Hab: <span className="font-semibold">{transfer.fromRoom || '-'}</span></p>
                          <p>🛏️ Cama: <span className="font-semibold">{transfer.fromBed || '-'}</span></p>
                        </div>
                      </div>
                      
                      {/* Ubicación Nueva */}
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-xs font-semibold text-green-700 mb-2 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Nueva Ubicación
                        </p>
                        <div className="space-y-1 text-sm">
                          <p>🏢 Piso: <span className="font-semibold">{transfer.toFloor}</span></p>
                          <p>🏥 Área: <span className="font-semibold">{transfer.toArea}</span></p>
                          <p>🚪 Hab: <span className="font-semibold">{transfer.toRoom}</span></p>
                          <p>🛏️ Cama: <span className="font-semibold">{transfer.toBed}</span></p>
                        </div>
                      </div>
                    </div>
                    
                    {transfer.reason && (
                      <div className="bg-white border border-orange-200 rounded-lg p-3 mb-3">
                        <p className="text-xs font-semibold text-orange-700 mb-1">📋 Motivo del traslado:</p>
                        <p className="text-sm text-gray-700">{transfer.reason}</p>
                      </div>
                    )}
                    
                    {transfer.notes && (
                      <div className="bg-white border border-orange-200 rounded-lg p-3 mb-3">
                        <p className="text-xs font-semibold text-orange-700 mb-1">📝 Notas adicionales:</p>
                        <p className="text-sm text-gray-700 italic">{transfer.notes}</p>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between pt-2 border-t border-orange-200">
                      <p className="text-xs text-gray-600">
                        👤 Trasladado por: <span className="font-semibold">{transfer.transferredBy}</span>
                      </p>
                      <p className="text-xs text-gray-400">#{transfer.id}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-3">
            <div className="flex items-center">
              <Activity className="mr-2 text-red-600" size={20} />
              <h3 className="text-lg md:text-xl font-bold">Historial de Signos Vitales</h3>
            </div>
            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold w-fit">
              {filteredVitals.length} de {patientVitals.length} {patientVitals.length === 1 ? 'registro' : 'registros'}
            </span>
          </div>
          
          {/* Filtros */}
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-red-800 flex items-center">
                🔍 Filtros de Búsqueda
              </h4>
              {(vitalFilters.dateFrom || vitalFilters.dateTo || vitalFilters.shift !== 'all') && (
                <button
                  onClick={clearVitalFilters}
                  className="text-xs px-3 py-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all font-semibold"
                >
                  ✕ Limpiar
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Filtro de fecha desde */}
              <div>
                <label className="block text-xs font-semibold text-red-700 mb-1">
                  📅 Fecha Desde
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 bg-white border-2 border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                  value={vitalFilters.dateFrom}
                  onChange={(e) => setVitalFilters(prev => ({...prev, dateFrom: e.target.value}))}
                />
              </div>
              
              {/* Filtro de fecha hasta */}
              <div>
                <label className="block text-xs font-semibold text-red-700 mb-1">
                  📅 Fecha Hasta
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 bg-white border-2 border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                  value={vitalFilters.dateTo}
                  onChange={(e) => setVitalFilters(prev => ({...prev, dateTo: e.target.value}))}
                />
              </div>
              
              {/* Filtro de turno */}
              <div>
                <label className="block text-xs font-semibold text-red-700 mb-1">
                  🕐 Turno
                </label>
                <select
                  className="w-full px-3 py-2 bg-white border-2 border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm font-semibold"
                  value={vitalFilters.shift}
                  onChange={(e) => setVitalFilters(prev => ({...prev, shift: e.target.value}))}
                >
                  <option value="all">🌍 Todos los turnos</option>
                  <option value="morning">🌅 Mañana (07:00 - 15:00)</option>
                  <option value="afternoon">🌆 Tarde (15:00 - 23:00)</option>
                  <option value="night">🌙 Noche (23:00 - 07:00)</option>
                </select>
              </div>
            </div>
            
            {/* Resumen de filtros activos */}
            {(vitalFilters.dateFrom || vitalFilters.dateTo || vitalFilters.shift !== 'all') && (
              <div className="mt-3 pt-3 border-t border-red-200">
                <p className="text-xs text-red-700">
                  <span className="font-bold">Filtros activos:</span>
                  {vitalFilters.dateFrom && <span className="ml-2">📅 Desde {new Date(vitalFilters.dateFrom).toLocaleDateString('es-ES')}</span>}
                  {vitalFilters.dateTo && <span className="ml-2">📅 Hasta {new Date(vitalFilters.dateTo).toLocaleDateString('es-ES')}</span>}
                  {vitalFilters.shift !== 'all' && (
                    <span className="ml-2">
                      🕐 {vitalFilters.shift === 'morning' ? 'Turno Mañana' : vitalFilters.shift === 'afternoon' ? 'Turno Tarde' : 'Turno Noche'}
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>
          
          {/* Lista de signos vitales filtrados */}
          {filteredVitals.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {filteredVitals.slice().reverse().map((vital, index) => {
                const vitalDate = new Date(vital.date);
                const isToday = vitalDate.toDateString() === new Date().toDateString();
                const isRecent = (Date.now() - vitalDate.getTime()) < 3600000; // Última hora
                const shift = getShiftFromTime(vital.date);
                const shiftNames = {
                  morning: '🌅 Mañana',
                  afternoon: '🌆 Tarde',
                  night: '🌙 Noche'
                };
                
                return (
                  <div key={vital.id || index} className="border-l-4 border-red-300 bg-red-50 rounded-xl p-4 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Clock className="text-red-600" size={16} />
                        <span className="font-bold text-gray-800 text-sm">
                          📅 {vitalDate.toLocaleDateString('es-ES', { 
                            day: 'numeric', 
                            month: 'long', 
                            year: 'numeric' 
                          })}
                        </span>
                        <span className="text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full font-semibold">
                          {shiftNames[shift]}
                        </span>
                        {isToday && (
                          <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full font-semibold">
                            HOY
                          </span>
                        )}
                        {isRecent && (
                          <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full font-semibold">
                            RECIENTE
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-bold text-red-700">
                        🕐 {vitalDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="bg-white p-2.5 rounded-lg">
                        <p className="text-xs text-gray-600 flex items-center gap-1">
                          🌡️ Temperatura
                        </p>
                        <p className="font-bold text-base text-gray-800">{vital.temperature}°C</p>
                      </div>
                      <div className="bg-white p-2.5 rounded-lg">
                        <p className="text-xs text-gray-600 flex items-center gap-1">
                          💓 Presión Arterial
                        </p>
                        <p className="font-bold text-base text-gray-800">{vital.bloodPressure} mmHg</p>
                      </div>
                      <div className="bg-white p-2.5 rounded-lg">
                        <p className="text-xs text-gray-600 flex items-center gap-1">
                          ❤️ Frec. Cardíaca
                        </p>
                        <p className="font-bold text-base text-gray-800">{vital.heartRate} lpm</p>
                      </div>
                      <div className="bg-white p-2.5 rounded-lg">
                        <p className="text-xs text-gray-600 flex items-center gap-1">
                          🫁 Frec. Respiratoria
                        </p>
                        <p className="font-bold text-base text-gray-800">{vital.respiratoryRate} rpm</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-red-200">
                      <p className="text-xs text-gray-600">
                        👨‍⚕️ <span className="font-semibold">{vital.registeredBy}</span>
                      </p>
                      <p className="text-xs text-gray-400">#{vital.id}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Activity className="mx-auto mb-3 text-gray-400" size={48} />
              {patientVitals.length === 0 ? (
                <>
                  <p className="text-sm">No hay signos vitales registrados</p>
                  <p className="text-xs mt-2">Los registros de signos vitales aparecerán aquí</p>
                </>
              ) : (
                <>
                  <p className="text-sm">No hay registros que coincidan con los filtros</p>
                  <p className="text-xs mt-2">Intenta ajustar los criterios de búsqueda</p>
                  <button
                    onClick={clearVitalFilters}
                    className="mt-3 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all text-sm font-semibold"
                  >
                    🔄 Restablecer filtros
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg md:text-xl font-bold flex items-center">
              <FileText className="mr-2 text-blue-600" size={20} />
              Historial de Notas Evolutivas
            </h3>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                {patientNotes.length} {patientNotes.length === 1 ? 'nota' : 'notas'}
              </span>
            </div>
          </div>
          
          {patientNotes.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {patientNotes.slice().reverse().map((note, index) => {
                const noteTypeIcons = {
                  'evolutiva': '📋',
                  'observacion': '👁️',
                  'incidente': '⚠️',
                  'mejora': '✅',
                  'deterioro': '🔴'
                };
                const noteTypeColors = {
                  'evolutiva': 'border-blue-200 bg-blue-50',
                  'observacion': 'border-purple-200 bg-purple-50',
                  'incidente': 'border-orange-200 bg-orange-50',
                  'mejora': 'border-green-200 bg-green-50',
                  'deterioro': 'border-red-200 bg-red-50'
                };
                const noteTypeNames = {
                  'evolutiva': 'Nota Evolutiva',
                  'observacion': 'Observación',
                  'incidente': 'Incidente',
                  'mejora': 'Mejoría',
                  'deterioro': 'Deterioro'
                };
                
                const noteDate = new Date(note.date);
                const isRecent = (Date.now() - noteDate.getTime()) < 86400000; // Últimas 24 horas
                
                return (
                  <div 
                    key={note.id || index} 
                    className={`border-l-4 ${noteTypeColors[note.noteType || 'evolutiva'] || 'border-blue-200 bg-blue-50'} p-4 rounded-xl hover:shadow-md transition-all`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{noteTypeIcons[note.noteType || 'evolutiva'] || '📋'}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-800 text-sm">
                              {noteTypeNames[note.noteType || 'evolutiva'] || 'Nota Evolutiva'}
                            </span>
                            {isRecent && (
                              <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full font-semibold">
                                RECIENTE
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">
                            📅 {noteDate.toLocaleDateString('es-ES', { 
                              day: 'numeric', 
                              month: 'long', 
                              year: 'numeric',
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-700 leading-relaxed mb-2 pl-8 whitespace-pre-wrap">
                      {note.note}
                    </p>
                    
                    <div className="flex items-center justify-between pl-8 pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        👨‍⚕️ <span className="font-semibold">{note.nurseName}</span>
                      </p>
                      <p className="text-xs text-gray-400">
                        #{note.id}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText className="mx-auto mb-3 text-gray-400" size={48} />
              <p className="text-sm">No hay notas evolutivas registradas para este paciente</p>
              <p className="text-xs mt-2">Las notas de enfermería aparecerán aquí cuando se registren</p>
            </div>
          )}
          
          {/* Resumen por tipo de nota */}
          {patientNotes.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs font-semibold text-gray-600 mb-2">Resumen por tipo:</p>
              <div className="flex flex-wrap gap-2">
                {['evolutiva', 'observacion', 'incidente', 'mejora', 'deterioro'].map(type => {
                  const count = patientNotes.filter(n => (n.noteType || 'evolutiva') === type).length;
                  if (count === 0) return null;
                  
                  const typeInfo = {
                    'evolutiva': { icon: '📋', color: 'bg-blue-100 text-blue-700', name: 'Evolutivas' },
                    'observacion': { icon: '👁️', color: 'bg-purple-100 text-purple-700', name: 'Observaciones' },
                    'incidente': { icon: '⚠️', color: 'bg-orange-100 text-orange-700', name: 'Incidentes' },
                    'mejora': { icon: '✅', color: 'bg-green-100 text-green-700', name: 'Mejorías' },
                    'deterioro': { icon: '🔴', color: 'bg-red-100 text-red-700', name: 'Deterioros' }
                  };
                  
                  return (
                    <span 
                      key={type}
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${typeInfo[type].color}`}
                    >
                      {typeInfo[type].icon} {count} {typeInfo[type].name}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg md:text-xl font-bold flex items-center">
              <Pill className="mr-2 text-green-600" size={20} />
              Tratamientos Asignados
            </h3>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
              {patientTreatments.length} {patientTreatments.length === 1 ? 'tratamiento' : 'tratamientos'}
            </span>
          </div>
          {patientTreatments.length > 0 ? (
            <div className="space-y-4">
              {patientTreatments.map(trt => {
                const startDate = new Date(trt.startDate);
                const isActive = trt.status === 'Activo' || !trt.status;
                const administrationTimes = trt.administrationTimes ? trt.administrationTimes.split(',') : [];
                
                return (
                  <div key={trt.id} className="border-l-4 border-green-400 bg-green-50 rounded-xl p-4 hover:shadow-md transition-all">
                    {/* Encabezado del tratamiento */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="bg-green-500 p-2 rounded-lg">
                          <Pill className="text-white" size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-lg text-gray-800">{trt.medication}</h4>
                          <p className="text-sm text-gray-600">Dosis: <span className="font-semibold text-green-700">{trt.dose}</span></p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        isActive ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'
                      }`}>
                        {trt.status || 'Activo'}
                      </span>
                    </div>
                    
                    {/* Información del tratamiento */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                      <div className="bg-white p-3 rounded-lg border border-green-200">
                        <p className="text-xs text-gray-600 mb-1 flex items-center">
                          <Clock size={14} className="mr-1 text-green-600" />
                          Frecuencia
                        </p>
                        <p className="font-semibold text-sm text-gray-800">{trt.frequency}</p>
                      </div>
                      
                      {trt.responsibleDoctor && (
                        <div className="bg-white p-3 rounded-lg border border-green-200">
                          <p className="text-xs text-gray-600 mb-1 flex items-center">
                            <User size={14} className="mr-1 text-green-600" />
                            Médico Responsable
                          </p>
                          <p className="font-semibold text-sm text-gray-800">{trt.responsibleDoctor}</p>
                        </div>
                      )}
                      
                      <div className="bg-white p-3 rounded-lg border border-green-200">
                        <p className="text-xs text-gray-600 mb-1 flex items-center">
                          📅 Fecha de Inicio
                        </p>
                        <p className="font-semibold text-sm text-gray-800">
                          {startDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                      
                      <div className="bg-white p-3 rounded-lg border border-green-200">
                        <p className="text-xs text-gray-600 mb-1 flex items-center">
                          ⏰ Última Aplicación
                        </p>
                        <p className="font-semibold text-sm text-gray-800">
                          {new Date(trt.lastApplication).toLocaleString('es-ES', { 
                            day: 'numeric', 
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    
                    {/* Horarios de administración */}
                    {administrationTimes.length > 0 && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                        <p className="text-xs font-semibold text-blue-700 mb-2 flex items-center">
                          <Clock size={14} className="mr-1" />
                          Horarios de Administración
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {administrationTimes.map((time, idx) => (
                            <span key={idx} className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-semibold">
                              🕐 {time.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Notas */}
                    {trt.notes && (
                      <div className="bg-white border border-green-200 rounded-lg p-3 mb-3">
                        <p className="text-xs font-semibold text-green-700 mb-1">📝 Notas:</p>
                        <p className="text-sm text-gray-700 italic">{trt.notes}</p>
                      </div>
                    )}
                    
                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-green-200">
                      <p className="text-xs text-gray-600">
                        👨‍⚕️ Aplicado por: <span className="font-semibold">{trt.appliedBy}</span>
                      </p>
                      <p className="text-xs text-gray-400">#{trt.id}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Pill className="mx-auto mb-3 text-gray-400" size={48} />
              <p className="text-sm">No hay tratamientos asignados</p>
              <p className="text-xs mt-2">Los tratamientos aparecerán aquí cuando sean prescritos</p>
            </div>
          )}
        </div>

        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
          <h3 className="text-lg md:text-xl font-bold mb-4 flex items-center">
            <FileText className="mr-2 text-blue-600" size={20} />
            Historial Médico
          </h3>
          {patientHistory.length > 0 ? (
            <div className="space-y-3">
              {patientHistory.map(record => (
                <div key={record.id} className="border border-gray-200 p-3 md:p-4 rounded-lg">
                  <p className="font-semibold text-sm md:text-base text-gray-800">{record.diagnosis}</p>
                  <p className="text-xs md:text-sm text-gray-600 mt-1">Fecha: {record.date}</p>
                  <p className="text-xs md:text-sm text-gray-600">Médico: {record.doctor}</p>
                  <p className="text-xs md:text-sm text-gray-600">Tratamiento: {record.treatment}</p>
                  <p className="text-xs md:text-sm text-gray-500 mt-2">{record.notes}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No hay historial médico registrado</p>
          )}
        </div>

        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
          <h3 className="text-lg md:text-xl font-bold mb-4 flex items-center">
            <TestTube className="mr-2 text-blue-600" size={20} />
            Resultados de Laboratorio
          </h3>
          {patientLabs.length > 0 ? (
            <div className="space-y-3">
              {patientLabs.map(test => (
                <div key={test.id} className="border border-gray-200 p-3 md:p-4 rounded-lg">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <div>
                      <p className="font-semibold text-sm md:text-base text-gray-800">{test.test}</p>
                      <p className="text-xs md:text-sm text-gray-600">Fecha: {test.date}</p>
                      <p className="text-xs md:text-sm text-gray-600">Ordenado por: {test.orderedBy}</p>
                      <p className="text-xs md:text-sm text-gray-600">Resultados: {test.results}</p>
                    </div>
                    <span className={'px-2 md:px-3 py-1 rounded-full text-xs font-semibold ' + (test.status === 'Completado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800')}>
                      {test.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No hay resultados de laboratorio</p>
          )}
        </div>

        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
          <h3 className="text-lg md:text-xl font-bold mb-4 flex items-center">
            <Calendar className="mr-2 text-green-600" size={20} />
            Citas Programadas
          </h3>
          {patientAppointments.length > 0 ? (
            <div className="space-y-3">
              {patientAppointments.map(apt => (
                <div key={apt.id} className="border border-gray-200 p-3 md:p-4 rounded-lg">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <div>
                      <p className="font-semibold text-sm md:text-base text-gray-800">{apt.type}</p>
                      <p className="text-xs md:text-sm text-gray-600">{apt.date} a las {apt.time}</p>
                      <p className="text-xs md:text-sm text-gray-600">Médico: {apt.doctor}</p>
                    </div>
                    <span className={'px-2 md:px-3 py-1 rounded-full text-xs font-semibold ' + (apt.status === 'Confirmada' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800')}>
                      {apt.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No hay citas programadas</p>
          )}
        </div>
      </div>
    );
  };

  const HomePage = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 animate-fadeIn">
      <nav className="glass-effect border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="absolute inset-0 bg-white rounded-full blur-md opacity-50"></div>
              <Activity className="text-purple-600 relative" size={32} />
            </div>
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-700 to-blue-700 bg-clip-text text-transparent">
              Hospital San Rafael
            </h1>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Hero Section with Large Login/Register Buttons */}
        <div className="text-center mb-12 md:mb-16 animate-scaleIn">
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-2xl">
            Bienvenido a Hospital San Rafael
          </h2>
          <p className="text-2xl md:text-3xl text-white/90 drop-shadow-lg font-medium mb-12">
            Cuidado médico de excelencia con tecnología de vanguardia
          </p>
          
          {/* HUGE Login/Register Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center max-w-3xl mx-auto mb-8">
            <button 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCurrentView('login');
              }} 
              className="group relative w-full sm:w-80 px-12 py-8 bg-gradient-to-r from-purple-600 via-purple-700 to-blue-600 text-white rounded-3xl hover:from-purple-700 hover:via-purple-800 hover:to-blue-700 transition-all duration-300 font-bold text-3xl shadow-2xl hover:shadow-purple-500/50 transform hover:scale-105 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative flex items-center justify-center gap-4">
                <User size={40} className="animate-pulse" />
                <span>Iniciar Sesión</span>
              </div>
            </button>
            
            <button 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCurrentView('register');
              }} 
              className="group relative w-full sm:w-80 px-12 py-8 bg-white text-purple-700 rounded-3xl hover:bg-gray-50 transition-all duration-300 font-bold text-3xl shadow-2xl border-4 border-white/50 transform hover:scale-105 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative flex items-center justify-center gap-4">
                <Users size={40} />
                <span>Registrarse</span>
              </div>
            </button>
          </div>
          
          <p className="text-lg text-white/80 font-medium">
            ¿Nuevo usuario? Regístrese para acceder a todos nuestros servicios
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16">
          <div className="glass-effect p-8 rounded-2xl card-hover border border-white/30 animate-fadeIn" style={{animationDelay: '0.1s'}}>
            <div className="relative inline-block mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full blur-lg opacity-50"></div>
              <Calendar className="text-blue-600 relative" size={48} />
            </div>
            <h3 className="text-xl md:text-2xl font-bold mb-3 text-gray-800">Agendar Cita</h3>
            <p className="text-gray-600 leading-relaxed">Reserve su consulta médica de forma rápida y sencilla</p>
          </div>
          <div className="glass-effect p-8 rounded-2xl card-hover border border-white/30 animate-fadeIn" style={{animationDelay: '0.2s'}}>
            <div className="relative inline-block mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-600 rounded-full blur-lg opacity-50"></div>
              <FileText className="text-emerald-600 relative" size={48} />
            </div>
            <h3 className="text-xl md:text-2xl font-bold mb-3 text-gray-800">Historial Médico</h3>
            <p className="text-gray-600 leading-relaxed">Acceda a su historial clínico completo en línea</p>
          </div>
          <div className="glass-effect p-8 rounded-2xl card-hover border border-white/30 animate-fadeIn" style={{animationDelay: '0.3s'}}>
            <div className="relative inline-block mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full blur-lg opacity-50"></div>
              <TestTube className="text-purple-600 relative" size={48} />
            </div>
            <h3 className="text-xl md:text-2xl font-bold mb-3 text-gray-800">Laboratorio</h3>
            <p className="text-gray-600 leading-relaxed">Consulte resultados de estudios y análisis</p>
          </div>
        </div>

        {/* Specialties Section */}
        <div className="glass-effect p-8 md:p-10 rounded-2xl border border-white/30 mb-12 md:mb-16 animate-fadeIn" style={{animationDelay: '0.4s'}}>
          <h3 className="text-3xl md:text-4xl font-bold mb-8 text-center bg-gradient-to-r from-purple-700 to-blue-700 bg-clip-text text-transparent">
            Nuestras Especialidades
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {specialties.map((specialty, idx) => {
              const Icon = specialty.icon;
              return (
                <div key={idx} className="bg-white p-6 rounded-xl border-2 border-gray-100 hover:border-purple-300 transition-all cursor-pointer card-hover group">
                  <Icon className="text-purple-600 mb-3 group-hover:scale-110 transition-transform" size={36} />
                  <h4 className="text-lg font-bold mb-2 text-gray-800">{specialty.name}</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">{specialty.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="relative glass-effect p-10 md:p-12 rounded-2xl border border-white/30 text-center overflow-hidden animate-fadeIn" style={{animationDelay: '0.5s'}}>
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-pink-500/10"></div>
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500 rounded-full mb-4 animate-pulse">
              <AlertCircle className="text-white" size={32} />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold mb-3 text-gray-800">Atención de Urgencias 24/7</h3>
            <p className="text-lg md:text-xl text-gray-600 mb-4">Estamos aquí para atenderle en cualquier momento</p>
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full font-bold text-xl md:text-2xl shadow-lg">
              <Phone className="animate-pulse" size={24} />
              Tel: (55) 5555-1234
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const NurseDashboard = () => {
    // Move nurse-specific state here to prevent parent re-renders
    const [newTreatment, setNewTreatment] = useState({ patientId: '', medication: '', dose: '', frequency: '', notes: '', applicationTime: '' });
    const [newVitalSigns, setNewVitalSigns] = useState({ patientId: '', temperature: '', bloodPressure: '', heartRate: '', respiratoryRate: '', dateTime: '' });
    const [newNurseNote, setNewNurseNote] = useState({ patientId: '', note: '', noteType: 'evolutiva' });
    const [newNonPharmaTreatment, setNewNonPharmaTreatment] = useState({ 
      patientId: '', 
      treatmentType: '', 
      description: '', 
      applicationTime: '', 
      duration: '', 
      materialsUsed: '', 
      observations: '',
      outcome: '',
      nextApplication: ''
    });
    const [assignedPatients, setAssignedPatients] = useState([]);
    const [nurseShifts, setNurseShifts] = useState([]);
    const [currentShift, setCurrentShift] = useState(null);
    const [loadingAssignments, setLoadingAssignments] = useState(true);

    // Load assigned patients and shifts
    useEffect(() => {
      loadNurseData();
    }, [currentUser]);

    const loadNurseData = async () => {
      if (!currentUser || currentUser.type !== 'nurse') return;
      
      setLoadingAssignments(true);
      try {
        const { getAssignedPatients, getNurseShiftsWithDetails, getActiveNurseShift } = await import('./services/database');
        
        // Get assigned patients for today
        const assigned = await getAssignedPatients(currentUser.id);
        setAssignedPatients(assigned);
        
        // Get shifts for this week
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - 3);
        const endDate = new Date(today);
        endDate.setDate(today.getDate() + 4);
        
        const shifts = await getNurseShiftsWithDetails(
          currentUser.id,
          startDate.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0]
        );
        setNurseShifts(shifts);
        
        // Get current active shift
        const activeShift = await getActiveNurseShift(currentUser.id);
        setCurrentShift(activeShift);
        
      } catch (error) {
        console.error('Error loading nurse data:', error);
      } finally {
        setLoadingAssignments(false);
      }
    };

    if (patientsLoading || loadingAssignments) {
      return (
        <div className="flex items-center justify-center min-h-[500px]">
          <div className="text-center animate-fadeIn">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
              <div className="spinner mx-auto relative"></div>
            </div>
            <p className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Cargando datos de enfermería...
            </p>
            <p className="text-sm text-gray-500 mt-2">Por favor espere un momento</p>
          </div>
        </div>
      );
    }

    return (
    <div className="space-y-6 page-transition">
      {/* Current Shift Info */}
      {currentShift && (
        <div className="glass-effect p-6 rounded-2xl shadow-lg border-l-4 border-green-500 bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Clock className="text-green-600" size={24} />
                Turno Actual Activo
              </h3>
              <p className="text-gray-600 mt-1">
                🕐 {currentShift.start_time} - {currentShift.end_time} • 
                <span className="ml-2 font-semibold">{currentShift.shift_type}</span> • 
                <span className="ml-2">{currentShift.department}</span>
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {assignedPatients.length} paciente(s) asignado(s)
              </p>
            </div>
            <div className="px-4 py-2 bg-green-500 text-white rounded-xl font-bold text-sm animate-pulse">
              EN TURNO
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="glass-effect p-6 rounded-2xl card-hover border-l-4 border-blue-500 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Mis Pacientes Asignados</p>
              <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                {assignedPatients.length}
              </p>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 rounded-full blur-lg opacity-30"></div>
              <Users className="text-blue-600 relative" size={40} />
            </div>
          </div>
        </div>
        
        <div className="glass-effect p-6 rounded-2xl card-hover border-l-4 border-green-500 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Citas Hoy</p>
              <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-400 bg-clip-text text-transparent">
                {appointments.filter(a => a.date === '2025-10-30').length}
              </p>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-green-500 rounded-full blur-lg opacity-30"></div>
              <Calendar className="text-green-600 relative" size={40} />
            </div>
          </div>
        </div>
        
        <div className="glass-effect p-6 rounded-2xl card-hover border-l-4 border-yellow-500 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Tratamientos Activos</p>
              <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-400 bg-clip-text text-transparent">
                {treatments.length}
              </p>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-yellow-500 rounded-full blur-lg opacity-30"></div>
              <Pill className="text-yellow-600 relative" size={40} />
            </div>
          </div>
        </div>
        
        <div className="glass-effect p-6 rounded-2xl card-hover border-l-4 border-red-500 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Triaje Rojo (Nivel 1-2)</p>
              <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-red-600 to-pink-400 bg-clip-text text-transparent">
                {assignedPatients.filter(p => (p.triage_level || 3) <= 2).length}
              </p>
              <p className="text-xs text-gray-500 mt-1">Atención inmediata</p>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-red-500 rounded-full blur-lg opacity-30 animate-pulse"></div>
              <AlertCircle className="text-red-600 relative" size={40} />
            </div>
          </div>
        </div>
      </div>

      {/* Triage Overview */}
      <div className="glass-effect p-6 rounded-2xl shadow-lg border border-gray-200/50">
        <h3 className="text-xl font-bold mb-5 flex items-center bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
          <AlertCircle className="mr-2 text-red-600" size={24} />
          Estado de Triaje - Mis Pacientes
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {[1, 2, 3, 4, 5].map(level => {
            const triageInfo = getTriageInfo(level);
            const count = assignedPatients.filter(p => (p.triage_level || 3) === level).length;
            return (
              <div 
                key={level}
                className={`${triageInfo.bgLight} border-2 ${triageInfo.borderColor} rounded-xl p-4 text-center transition-all hover:shadow-lg ${count > 0 ? 'cursor-pointer hover:scale-105' : 'opacity-60'}`}
              >
                <div className="text-4xl mb-2 ${level === 1 || level === 2 ? 'animate-pulse' : ''}">{triageInfo.icon}</div>
                <div className={`text-3xl font-bold ${triageInfo.textColor} mb-1`}>{count}</div>
                <div className={`text-xs font-semibold ${triageInfo.textColor} uppercase mb-1`}>
                  Nivel {level}
                </div>
                <div className="text-xs text-gray-600 font-medium">{triageInfo.priority}</div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-gray-700">
            <span className="font-bold">ℹ️ Sistema de Triaje:</span> 
            <span className="ml-2">1=Resucitación • 2=Emergencia • 3=Urgente • 4=Menos Urgente • 5=No Urgente</span>
          </p>
        </div>
      </div>

      {/* My Shift Schedule */}
      <div className="glass-effect p-6 rounded-2xl shadow-lg border border-gray-200/50">
        <h3 className="text-xl font-bold mb-5 flex items-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          <Clock className="mr-2 text-indigo-600" size={24} />
          Mi Jornada Laboral y Turnos
        </h3>
        {nurseShifts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b-2 border-indigo-200">
                  <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Fecha</th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Horario</th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Tipo de Turno</th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Departamento</th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Pacientes Asignados</th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Estado</th>
                </tr>
              </thead>
              <tbody>
                {nurseShifts.map(shift => {
                  const isToday = shift.date === new Date().toISOString().split('T')[0];
                  return (
                    <tr key={shift.id} className={`border-b border-gray-100 hover:bg-indigo-50/50 transition-colors ${isToday ? 'bg-green-50' : ''}`}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-800">
                        📅 {new Date(shift.date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                        {isToday && <span className="ml-2 text-xs bg-green-500 text-white px-2 py-1 rounded-full">HOY</span>}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">🕐 {shift.start_time} - {shift.end_time}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          shift.shift_type === 'Mañana' ? 'bg-yellow-100 text-yellow-800' :
                          shift.shift_type === 'Tarde' ? 'bg-orange-100 text-orange-800' :
                          'bg-indigo-100 text-indigo-800'
                        }`}>
                          {shift.shift_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{shift.department}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <span className="font-bold text-blue-600">{shift.assigned_patients_count || 0}</span> pacientes
                      </td>
                      <td className="px-4 py-3">
                        <span className={`status-badge ${
                          shift.status === 'Scheduled' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' :
                          shift.status === 'Completed' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' :
                          'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                        }`}>
                          {shift.status === 'Scheduled' ? 'Programado' : shift.status === 'Completed' ? 'Completado' : shift.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="mx-auto mb-3 text-gray-400" size={48} />
            <p>No hay turnos programados para los próximos días</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-effect p-6 rounded-2xl shadow-lg border border-gray-200/50">
          <h3 className="text-xl font-bold mb-4 flex items-center bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            <Users className="mr-2 text-purple-600" size={24} />
            Mis Pacientes Asignados
          </h3>
          {assignedPatients.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {assignedPatients.map(patient => {
                const triageInfo = getTriageInfo(patient.triage_level || 3);
                const patientNotesCount = nurseNotes.filter(n => n.patientId === patient.id).length;
                const recentNotesCount = nurseNotes.filter(n => {
                  if (n.patientId !== patient.id) return false;
                  const noteDate = new Date(n.date);
                  return (Date.now() - noteDate.getTime()) < 86400000; // Últimas 24 horas
                }).length;
                
                return (
                  <div 
                    key={patient.id} 
                    className={`bg-white border-l-4 ${triageInfo.borderColor} p-4 rounded-xl hover:shadow-lg transition-all group relative overflow-hidden`}
                  >
                    {/* Triage indicator background */}
                    <div className={`absolute top-0 right-0 w-24 h-24 ${triageInfo.bgLight} opacity-50 rounded-bl-full`}></div>
                    
                    <div className="relative">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-bold text-gray-800 text-lg">{patient.name}</p>
                            <span className={`text-2xl ${triageInfo.icon === '🔴' ? 'animate-pulse' : ''}`}>
                              {triageInfo.icon}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">🏥 Habitación {patient.room} • {patient.age} años</p>
                          <p className="text-xs text-gray-500">🩸 Tipo de sangre: {patient.blood_type}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className={'status-badge ' + (patient.condition === 'Crítico' ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white' : patient.condition === 'Estable' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white')}>
                            {patient.condition}
                          </span>
                        </div>
                      </div>
                      
                      {/* Triage level indicator */}
                      <div className={`mt-2 px-3 py-1.5 ${triageInfo.bgLight} border ${triageInfo.borderColor} rounded-lg`}>
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold ${triageInfo.textColor} uppercase`}>
                            Triaje: Nivel {patient.triage_level || 3}
                          </span>
                          <span className={`text-xs ${triageInfo.textColor} font-semibold`}>
                            ⏱️ {triageInfo.priority}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-0.5">{triageInfo.description}</p>
                      </div>
                      
                      {/* Notas evolutivas counter */}
                      {patientNotesCount > 0 && (
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex items-center gap-1 px-3 py-1 bg-blue-50 border border-blue-200 rounded-lg text-xs">
                            <FileText size={14} className="text-blue-600" />
                            <span className="font-semibold text-blue-700">
                              {patientNotesCount} {patientNotesCount === 1 ? 'nota' : 'notas'}
                            </span>
                            {recentNotesCount > 0 && (
                              <span className="ml-1 px-1.5 py-0.5 bg-green-500 text-white rounded text-xs font-bold">
                                {recentNotesCount} HOY
                              </span>
                            )}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              viewPatientDetails(patient);
                            }}
                            className="flex-1 px-3 py-1 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1"
                          >
                            <FileText size={14} />
                            Ver Historial
                          </button>
                        </div>
                      )}
                      
                      {patient.assignment_notes && (
                        <p className="text-xs text-gray-500 mt-2 italic bg-gray-50 p-2 rounded">📋 {patient.assignment_notes}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users className="mx-auto mb-3 text-gray-400" size={48} />
              <p>No hay pacientes asignados en este turno</p>
              <p className="text-sm mt-2">Contacte al supervisor de turno para obtener asignaciones</p>
            </div>
          )}
        </div>

        <div className="glass-effect p-6 rounded-2xl shadow-lg border border-gray-200/50">
          <h3 className="text-xl font-bold mb-5 flex items-center bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
            <Activity className="mr-2 text-red-600" size={24} />
            Registrar Signos Vitales
          </h3>
          <div className="space-y-4">
            <select
              key="vital-patient-select"
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm hover:shadow-md"
              value={newVitalSigns.patientId}
              onChange={(e) => setNewVitalSigns(prev => ({...prev, patientId: e.target.value}))}
            >
              <option value="">Seleccionar paciente</option>
              {assignedPatients.map(p => (
                <option key={p.id} value={p.id}>{p.name} - Hab. {p.room}</option>
              ))}
            </select>
            
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
              <label className="block text-xs font-semibold text-blue-700 mb-2 flex items-center">
                <Clock className="mr-1" size={14} />
                Fecha y Hora de Toma
              </label>
              <input
                type="datetime-local"
                className="w-full px-4 py-2.5 bg-white border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                value={newVitalSigns.dateTime}
                onChange={(e) => setNewVitalSigns(prev => ({...prev, dateTime: e.target.value}))}
                max={new Date().toISOString().slice(0, 16)}
              />
              <p className="text-xs text-blue-600 mt-1">⚡ Si no especifica, se usará la hora actual</p>
            </div>
            
            <input
              key="vital-temp"
              type="text"
              placeholder="🌡️ Temperatura (°C)"
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm hover:shadow-md"
              value={newVitalSigns.temperature}
              onChange={(e) => setNewVitalSigns(prev => ({...prev, temperature: e.target.value}))}
            />
            <input
              key="vital-bp"
              type="text"
              placeholder="💓 Presión Arterial (120/80)"
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm hover:shadow-md"
              value={newVitalSigns.bloodPressure}
              onChange={(e) => setNewVitalSigns(prev => ({...prev, bloodPressure: e.target.value}))}
            />
            <input
              key="vital-hr"
              type="text"
              placeholder="❤️ Frecuencia Cardíaca (lpm)"
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm hover:shadow-md"
              value={newVitalSigns.heartRate}
              onChange={(e) => setNewVitalSigns(prev => ({...prev, heartRate: e.target.value}))}
            />
            <input
              key="vital-rr"
              type="text"
              placeholder="🫁 Frecuencia Respiratoria (rpm)"
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm hover:shadow-md"
              value={newVitalSigns.respiratoryRate}
              onChange={(e) => setNewVitalSigns(prev => ({...prev, respiratoryRate: e.target.value}))}
            />
            <button
              onClick={registerVitalSigns}
              className="w-full py-3.5 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:from-red-600 hover:to-pink-600 transition-all font-bold shadow-lg hover:shadow-xl flex items-center justify-center"
            >
              <CheckCircle className="mr-2" size={20} />
              Registrar Signos Vitales
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-effect p-6 rounded-2xl shadow-lg border border-gray-200/50">
          <h3 className="text-xl font-bold mb-5 flex items-center bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            <Pill className="mr-2 text-green-600" size={24} />
            Administrar Medicamento
          </h3>
          <div className="space-y-4">
            <select
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm hover:shadow-md"
              value={newTreatment.patientId}
              onChange={(e) => setNewTreatment(prev => ({...prev, patientId: e.target.value}))}
            >
              <option value="">Seleccionar paciente</option>
              {assignedPatients.map(p => (
                <option key={p.id} value={p.id}>{p.name} - Hab. {p.room}</option>
              ))}
            </select>
            
            <div className="bg-green-50 border border-green-200 rounded-xl p-3">
              <label className="block text-xs font-semibold text-green-700 mb-2 flex items-center">
                <Clock className="mr-1" size={14} />
                Hora de Aplicación
              </label>
              <input
                type="time"
                className="w-full px-4 py-2.5 bg-white border-2 border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all shadow-sm"
                value={newTreatment.applicationTime}
                onChange={(e) => setNewTreatment(prev => ({...prev, applicationTime: e.target.value}))}
              />
              <p className="text-xs text-green-600 mt-1">⚡ Si no especifica, se usará la hora actual</p>
            </div>
            
            <input
              type="text"
              placeholder="💊 Medicamento"
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm hover:shadow-md"
              value={newTreatment.medication}
              onChange={(e) => setNewTreatment(prev => ({...prev, medication: e.target.value}))}
            />
            <input
              type="text"
              placeholder="📊 Dosis (ej: 50mg)"
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm hover:shadow-md"
              value={newTreatment.dose}
              onChange={(e) => setNewTreatment(prev => ({...prev, dose: e.target.value}))}
            />
            <input
              type="text"
              placeholder="⏰ Frecuencia (ej: Cada 8 horas)"
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm hover:shadow-md"
              value={newTreatment.frequency}
              onChange={(e) => setNewTreatment(prev => ({...prev, frequency: e.target.value}))}
            />
            <textarea
              placeholder="📝 Notas adicionales (opcional)"
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm hover:shadow-md resize-none"
              rows="3"
              value={newTreatment.notes}
              onChange={(e) => setNewTreatment(prev => ({...prev, notes: e.target.value}))}
            />
            <button
              onClick={applyTreatment}
              className="w-full py-3.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all font-bold shadow-lg hover:shadow-xl flex items-center justify-center"
            >
              <Pill className="mr-2" size={20} />
              Registrar Administración
            </button>
          </div>
        </div>

        <div className="glass-effect p-6 rounded-2xl shadow-lg border border-gray-200/50">
          <h3 className="text-xl font-bold mb-5 flex items-center bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            <FileText className="mr-2 text-blue-600" size={24} />
            Registrar Nota Evolutiva
          </h3>
          <div className="space-y-4">
            <select
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm hover:shadow-md"
              value={newNurseNote.patientId}
              onChange={(e) => setNewNurseNote(prev => ({...prev, patientId: e.target.value}))}
            >
              <option value="">Seleccionar paciente asignado</option>
              {assignedPatients.map(p => (
                <option key={p.id} value={p.id}>{p.name} - Hab. {p.room}</option>
              ))}
            </select>
            
            {/* Tipo de nota */}
            <select
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm hover:shadow-md"
              value={newNurseNote.noteType || 'evolutiva'}
              onChange={(e) => setNewNurseNote(prev => ({...prev, noteType: e.target.value}))}
            >
              <option value="evolutiva">📋 Nota Evolutiva</option>
              <option value="observacion">👁️ Observación</option>
              <option value="incidente">⚠️ Incidente</option>
              <option value="mejora">✅ Mejoría</option>
              <option value="deterioro">🔴 Deterioro</option>
            </select>
            
            {/* Plantillas rápidas */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setNewNurseNote(prev => ({...prev, note: (prev.note || '') + 'Paciente estable, sin cambios significativos. '}))}
                className="px-3 py-2 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition text-xs text-left"
              >
                💚 Estable
              </button>
              <button
                type="button"
                onClick={() => setNewNurseNote(prev => ({...prev, note: (prev.note || '') + 'Signos vitales dentro de rango normal. '}))}
                className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition text-xs text-left"
              >
                💙 Vitales normales
              </button>
              <button
                type="button"
                onClick={() => setNewNurseNote(prev => ({...prev, note: (prev.note || '') + 'Requiere monitoreo continuo. '}))}
                className="px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition text-xs text-left"
              >
                ⚠️ Monitoreo
              </button>
              <button
                type="button"
                onClick={() => setNewNurseNote(prev => ({...prev, note: (prev.note || '') + 'Paciente responde bien al tratamiento. '}))}
                className="px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition text-xs text-left"
              >
                ✅ Responde bien
              </button>
            </div>
            
            <textarea
              placeholder="📋 Escriba la nota evolutiva del paciente...

Ejemplo:
- Estado general del paciente
- Cambios observados desde la última revisión
- Respuesta a medicamentos o tratamientos
- Síntomas reportados
- Acciones tomadas"
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm hover:shadow-md resize-none"
              rows="8"
              value={newNurseNote.note}
              onChange={(e) => setNewNurseNote(prev => ({...prev, note: e.target.value}))}
            />
            
            <div className="flex gap-2">
              <button
                onClick={addNurseNote}
                className="flex-1 py-3.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all font-bold shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                <FileText className="mr-2" size={20} />
                Registrar Nota Evolutiva
              </button>
              <button
                type="button"
                onClick={() => setNewNurseNote({ patientId: '', note: '', noteType: 'evolutiva' })}
                className="px-6 py-3.5 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-semibold"
              >
                Limpiar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Formulario de Tratamientos No Farmacológicos */}
      <div className="glass-effect p-6 rounded-2xl shadow-lg border border-gray-200/50">
        <h3 className="text-xl font-bold mb-5 flex items-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          <Scissors className="mr-2 text-purple-600" size={24} />
          Registrar Tratamiento No Farmacológico
        </h3>
        <div className="space-y-4">
          <select
            className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm hover:shadow-md"
            value={newNonPharmaTreatment.patientId}
            onChange={(e) => setNewNonPharmaTreatment(prev => ({...prev, patientId: e.target.value}))}
          >
            <option value="">Seleccionar paciente</option>
            {assignedPatients.map(p => (
              <option key={p.id} value={p.id}>{p.name} - Hab. {p.room}</option>
            ))}
          </select>
          
          <select
            className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm hover:shadow-md font-semibold"
            value={newNonPharmaTreatment.treatmentType}
            onChange={(e) => setNewNonPharmaTreatment(prev => ({...prev, treatmentType: e.target.value}))}
          >
            <option value="">🏥 Tipo de Tratamiento</option>
            <option value="Curación">🩹 Curación</option>
            <option value="Nebulización">💨 Nebulización</option>
            <option value="Fluidoterapia">💧 Fluidoterapia</option>
            <option value="Oxigenoterapia">🫁 Oxigenoterapia</option>
            <option value="Fisioterapia Respiratoria">🌬️ Fisioterapia Respiratoria</option>
            <option value="Aspiración de Secreciones">🔬 Aspiración de Secreciones</option>
            <option value="Cambio de Sonda">🔌 Cambio de Sonda</option>
            <option value="Cambio de Catéter">💉 Cambio de Catéter</option>
            <option value="Enema">💊 Enema</option>
            <option value="Baño de Esponja">🧽 Baño de Esponja</option>
            <option value="Movilización">🤸 Movilización</option>
            <option value="Prevención de Úlceras">🛡️ Prevención de Úlceras por Presión</option>
            <option value="Otro">📝 Otro</option>
          </select>
          
          <textarea
            placeholder="📋 Descripción del tratamiento (detalle el procedimiento realizado)"
            className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm hover:shadow-md resize-none"
            rows="3"
            value={newNonPharmaTreatment.description}
            onChange={(e) => setNewNonPharmaTreatment(prev => ({...prev, description: e.target.value}))}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-3">
              <label className="block text-xs font-semibold text-purple-700 mb-2 flex items-center">
                <Clock className="mr-1" size={14} />
                Hora de Aplicación
              </label>
              <input
                type="time"
                className="w-full px-4 py-2.5 bg-white border-2 border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm"
                value={newNonPharmaTreatment.applicationTime}
                onChange={(e) => setNewNonPharmaTreatment(prev => ({...prev, applicationTime: e.target.value}))}
              />
              <p className="text-xs text-purple-600 mt-1">⚡ Si no especifica, se usará la hora actual</p>
            </div>
            
            <input
              type="text"
              placeholder="⏱️ Duración (ej: 30 minutos)"
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm hover:shadow-md"
              value={newNonPharmaTreatment.duration}
              onChange={(e) => setNewNonPharmaTreatment(prev => ({...prev, duration: e.target.value}))}
            />
          </div>
          
          <input
            type="text"
            placeholder="📦 Materiales utilizados (opcional)"
            className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm hover:shadow-md"
            value={newNonPharmaTreatment.materialsUsed}
            onChange={(e) => setNewNonPharmaTreatment(prev => ({...prev, materialsUsed: e.target.value}))}
          />
          
          <textarea
            placeholder="👁️ Observaciones durante el procedimiento (opcional)"
            className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm hover:shadow-md resize-none"
            rows="2"
            value={newNonPharmaTreatment.observations}
            onChange={(e) => setNewNonPharmaTreatment(prev => ({...prev, observations: e.target.value}))}
          />
          
          <input
            type="text"
            placeholder="✅ Resultado del tratamiento (opcional)"
            className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm hover:shadow-md"
            value={newNonPharmaTreatment.outcome}
            onChange={(e) => setNewNonPharmaTreatment(prev => ({...prev, outcome: e.target.value}))}
          />
          
          <input
            type="datetime-local"
            placeholder="📅 Próxima aplicación (opcional)"
            className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm hover:shadow-md"
            value={newNonPharmaTreatment.nextApplication}
            onChange={(e) => setNewNonPharmaTreatment(prev => ({...prev, nextApplication: e.target.value}))}
          />
          
          <button
            onClick={applyNonPharmaTreatment}
            className="w-full py-3.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all font-bold shadow-lg hover:shadow-xl flex items-center justify-center"
          >
            <Scissors className="mr-2" size={20} />
            Registrar Tratamiento
          </button>
        </div>
      </div>

      {/* Notas Evolutivas del Turno */}
      <div className="glass-effect p-6 rounded-2xl shadow-lg border border-gray-200/50">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl font-bold flex items-center bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
            <FileText className="mr-2 text-indigo-600" size={24} />
            Notas Evolutivas del Turno
          </h3>
          <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold">
            {nurseNotes.filter(note => {
              const noteDate = new Date(note.date);
              const today = new Date();
              return noteDate.toDateString() === today.toDateString();
            }).length} notas hoy
          </span>
        </div>
        
        {nurseNotes.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {nurseNotes.slice().reverse().map((note, index) => {
              const patient = assignedPatients.find(p => p.id === note.patientId) || patients.find(p => p.id === note.patientId);
              const noteDate = new Date(note.date);
              const isToday = noteDate.toDateString() === new Date().toDateString();
              const noteTypeIcons = {
                'evolutiva': '📋',
                'observacion': '👁️',
                'incidente': '⚠️',
                'mejora': '✅',
                'deterioro': '🔴'
              };
              const noteTypeColors = {
                'evolutiva': 'border-blue-200 bg-blue-50',
                'observacion': 'border-purple-200 bg-purple-50',
                'incidente': 'border-orange-200 bg-orange-50',
                'mejora': 'border-green-200 bg-green-50',
                'deterioro': 'border-red-200 bg-red-50'
              };
              
              return (
                <div 
                  key={note.id || index} 
                  className={`border-l-4 ${noteTypeColors[note.noteType || 'evolutiva'] || 'border-blue-200 bg-blue-50'} p-4 rounded-xl hover:shadow-md transition-all`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{noteTypeIcons[note.noteType || 'evolutiva'] || '📋'}</span>
                      <div>
                        <p className="font-bold text-gray-800">
                          {patient ? patient.name : 'Paciente desconocido'}
                          {isToday && <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">HOY</span>}
                        </p>
                        <p className="text-xs text-gray-500">
                          🏥 Habitación {patient?.room} • 
                          <span className="ml-1">📅 {noteDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 uppercase">
                      {note.noteType || 'Evolutiva'}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-700 leading-relaxed mb-2 pl-8 whitespace-pre-wrap">
                    {note.note}
                  </p>
                  
                  <div className="flex items-center justify-between pl-8 pt-2 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      👨‍⚕️ Registrado por: <span className="font-semibold">{note.nurseName}</span>
                    </p>
                    <p className="text-xs text-gray-400">
                      #{note.id}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FileText className="mx-auto mb-3 text-gray-400" size={48} />
            <p>No hay notas evolutivas registradas</p>
            <p className="text-sm mt-2">Registre la primera nota del turno arriba</p>
          </div>
        )}
      </div>

      {/* Historial de Tratamientos No Farmacológicos */}
      <div className="glass-effect p-6 rounded-2xl shadow-lg border border-gray-200/50">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl font-bold flex items-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            <Scissors className="mr-2 text-purple-600" size={24} />
            Tratamientos No Farmacológicos del Turno
          </h3>
          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
            {nonPharmaTreatments.filter(treatment => {
              const treatmentDate = new Date(treatment.applicationDate);
              const today = new Date();
              return treatmentDate.toDateString() === today.toDateString();
            }).length} tratamientos hoy
          </span>
        </div>
        
        {nonPharmaTreatments.length > 0 ? (
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {nonPharmaTreatments.slice().reverse().map((treatment, index) => {
              const patient = assignedPatients.find(p => p.id === treatment.patientId) || patients.find(p => p.id === treatment.patientId);
              const treatmentDate = new Date(treatment.applicationDate);
              const isToday = treatmentDate.toDateString() === new Date().toDateString();
              const isRecent = (Date.now() - treatmentDate.getTime()) < 3600000; // Última hora
              
              const treatmentTypeIcons = {
                'Curación': '🩹',
                'Nebulización': '💨',
                'Fluidoterapia': '💧',
                'Oxigenoterapia': '🫁',
                'Fisioterapia Respiratoria': '🌬️',
                'Aspiración de Secreciones': '🔬',
                'Cambio de Sonda': '🔌',
                'Cambio de Catéter': '💉',
                'Enema': '💊',
                'Baño de Esponja': '🧽',
                'Movilización': '🤸',
                'Prevención de Úlceras': '🛡️',
                'Otro': '📝'
              };
              
              return (
                <div 
                  key={treatment.id || index} 
                  className="border-l-4 border-purple-300 bg-purple-50 rounded-xl p-4 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 flex-1">
                      <div className="bg-purple-500 text-white p-2 rounded-lg">
                        <Scissors size={20} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-gray-800">
                            {patient ? patient.name : 'Paciente desconocido'}
                          </p>
                          {isToday && <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">HOY</span>}
                          {isRecent && <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">RECIENTE</span>}
                        </div>
                        <p className="text-xs text-gray-500">
                          🏥 Habitación {patient?.room} • 
                          <Clock className="inline ml-1 mr-1" size={12} />
                          {treatment.applicationTime || 'Hora no especificada'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-3 mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{treatmentTypeIcons[treatment.treatmentType] || '📝'}</span>
                      <span className="font-bold text-purple-700 text-lg">{treatment.treatmentType}</span>
                      {treatment.duration && (
                        <span className="ml-auto text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded-full font-semibold">
                          ⏱️ {treatment.duration}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {treatment.description}
                    </p>
                  </div>
                  
                  {treatment.materialsUsed && (
                    <div className="bg-white rounded-lg p-2.5 mb-2">
                      <p className="text-xs text-gray-600 font-semibold mb-1">📦 Materiales utilizados:</p>
                      <p className="text-sm text-gray-700">{treatment.materialsUsed}</p>
                    </div>
                  )}
                  
                  {treatment.observations && (
                    <div className="bg-white rounded-lg p-2.5 mb-2">
                      <p className="text-xs text-gray-600 font-semibold mb-1">👁️ Observaciones:</p>
                      <p className="text-sm text-gray-700 italic">{treatment.observations}</p>
                    </div>
                  )}
                  
                  {treatment.outcome && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-2.5 mb-2">
                      <p className="text-xs text-green-700 font-semibold mb-1">✅ Resultado:</p>
                      <p className="text-sm text-green-800">{treatment.outcome}</p>
                    </div>
                  )}
                  
                  {treatment.nextApplication && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 mb-2">
                      <p className="text-xs text-blue-700 font-semibold mb-1">📅 Próxima aplicación:</p>
                      <p className="text-sm text-blue-800">
                        {new Date(treatment.nextApplication).toLocaleString('es-ES', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-2 border-t border-purple-200">
                    <div className="flex flex-col gap-1">
                      <p className="text-xs text-gray-500">
                        👨‍⚕️ Realizado por: <span className="font-semibold">{treatment.performedBy}</span>
                      </p>
                      <p className="text-xs text-gray-500">
                        📅 {treatmentDate.toLocaleDateString('es-ES', { 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                      {treatment.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Scissors className="mx-auto mb-3 text-gray-400" size={48} />
            <p>No hay tratamientos no farmacológicos registrados</p>
            <p className="text-sm mt-2">Registre el primer tratamiento del turno arriba</p>
          </div>
        )}
      </div>

      {/* Signos Vitales del Turno */}
      <div className="glass-effect p-6 rounded-2xl shadow-lg border border-gray-200/50">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl font-bold flex items-center bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
            <Activity className="mr-2 text-red-600" size={24} />
            Signos Vitales del Turno
          </h3>
          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
            {vitalSigns.filter(vital => {
              const vitalDate = new Date(vital.date);
              const today = new Date();
              return vitalDate.toDateString() === today.toDateString();
            }).length} registros hoy
          </span>
        </div>
        
        {vitalSigns.length > 0 ? (
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {vitalSigns.slice().reverse().map((vital, index) => {
              const patient = patients.find(p => p.id === vital.patientId);
              const vitalDate = new Date(vital.date);
              const today = new Date();
              const isToday = vitalDate.toDateString() === today.toDateString();
              const isRecent = (Date.now() - vitalDate.getTime()) < 3600000; // Última hora
              
              return (
                <div 
                  key={vital.id || index} 
                  className="border-l-4 border-red-300 bg-red-50 rounded-xl p-4 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Activity className="text-red-600" size={20} />
                      <div>
                        <p className="font-bold text-gray-800">
                          {patient ? patient.name : 'Paciente desconocido'}
                          {isToday && <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">HOY</span>}
                          {isRecent && <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">RECIENTE</span>}
                        </p>
                        <p className="text-xs text-gray-500">
                          🏥 Habitación {patient?.room} • 
                          <Clock className="inline ml-1 mr-1" size={12} />
                          {vitalDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} - {vitalDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-3 pl-7">
                    <div className="bg-white p-2.5 rounded-lg">
                      <p className="text-xs text-gray-600 flex items-center gap-1">
                        🌡️ Temperatura
                      </p>
                      <p className="font-bold text-base text-gray-800">{vital.temperature}°C</p>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg">
                      <p className="text-xs text-gray-600 flex items-center gap-1">
                        💓 Presión Arterial
                      </p>
                      <p className="font-bold text-base text-gray-800">{vital.bloodPressure} mmHg</p>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg">
                      <p className="text-xs text-gray-600 flex items-center gap-1">
                        ❤️ Frec. Cardíaca
                      </p>
                      <p className="font-bold text-base text-gray-800">{vital.heartRate} lpm</p>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg">
                      <p className="text-xs text-gray-600 flex items-center gap-1">
                        🫁 Frec. Respiratoria
                      </p>
                      <p className="font-bold text-base text-gray-800">{vital.respiratoryRate} rpm</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pl-7 pt-2 border-t border-red-200">
                    <p className="text-xs text-gray-500">
                      👨‍⚕️ Registrado por: <span className="font-semibold">{vital.registeredBy}</span>
                    </p>
                    <p className="text-xs text-gray-400">
                      #{vital.id}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Activity className="mx-auto mb-3 text-gray-400" size={48} />
            <p>No hay signos vitales registrados</p>
            <p className="text-sm mt-2">Registre los primeros signos vitales del turno arriba</p>
          </div>
        )}
      </div>

      {/* Administración de Medicamentos del Turno */}
      <div className="glass-effect p-6 rounded-2xl shadow-lg border border-gray-200/50">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl font-bold flex items-center bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            <Pill className="mr-2 text-green-600" size={24} />
            Administración de Medicamentos del Turno
          </h3>
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
            {treatments.filter(treatment => {
              const treatmentDate = new Date(treatment.lastApplication);
              const today = new Date();
              return treatmentDate.toDateString() === today.toDateString();
            }).length} administraciones hoy
          </span>
        </div>
        
        {treatments.length > 0 ? (
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {treatments.slice().reverse().map((treatment, index) => {
              const patient = patients.find(p => p.id === treatment.patientId);
              const treatmentDate = new Date(treatment.lastApplication);
              const today = new Date();
              const isToday = treatmentDate.toDateString() === today.toDateString();
              const isRecent = (Date.now() - treatmentDate.getTime()) < 3600000; // Última hora
              
              // Extraer solo la hora de la última aplicación
              const applicationTime = treatmentDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
              
              return (
                <div 
                  key={treatment.id || index} 
                  className="border-l-4 border-green-300 bg-green-50 rounded-xl p-4 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Pill className="text-green-600" size={20} />
                      <div>
                        <p className="font-bold text-gray-800">
                          {patient ? patient.name : 'Paciente desconocido'}
                          {isToday && <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">HOY</span>}
                          {isRecent && <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">RECIENTE</span>}
                        </p>
                        <p className="text-xs text-gray-500">
                          🏥 Habitación {patient?.room} • 
                          <Clock className="inline ml-1 mr-1" size={12} />
                          Hora de aplicación: <span className="font-bold text-green-700">{applicationTime}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3 pl-7">
                    <div className="bg-white p-2.5 rounded-lg">
                      <p className="text-xs text-gray-600 flex items-center gap-1">
                        💊 Medicamento
                      </p>
                      <p className="font-bold text-sm text-gray-800">{treatment.medication}</p>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg">
                      <p className="text-xs text-gray-600 flex items-center gap-1">
                        📊 Dosis
                      </p>
                      <p className="font-bold text-sm text-gray-800">{treatment.dose}</p>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg">
                      <p className="text-xs text-gray-600 flex items-center gap-1">
                        ⏰ Frecuencia
                      </p>
                      <p className="font-bold text-sm text-gray-800">{treatment.frequency}</p>
                    </div>
                  </div>
                  
                  {treatment.notes && (
                    <div className="bg-white p-2.5 rounded-lg mb-3 pl-7">
                      <p className="text-xs text-gray-600 mb-1">📝 Notas:</p>
                      <p className="text-sm text-gray-700 italic">{treatment.notes}</p>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pl-7 pt-2 border-t border-green-200">
                    <p className="text-xs text-gray-500">
                      👨‍⚕️ Administrado por: <span className="font-semibold">{treatment.appliedBy}</span>
                    </p>
                    <p className="text-xs text-gray-400">
                      #{treatment.id}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Pill className="mx-auto mb-3 text-gray-400" size={48} />
            <p>No hay medicamentos administrados</p>
            <p className="text-sm mt-2">Registre la primera administración del turno arriba</p>
          </div>
        )}
      </div>

      <div className="glass-effect p-6 rounded-2xl shadow-lg border border-gray-200/50">
        <h3 className="text-xl font-bold mb-5 flex items-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          <Clock className="mr-2 text-blue-600" size={24} />
          Citas Programadas del Día
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="bg-gradient-to-r from-purple-50 to-blue-50 border-b-2 border-purple-200">
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Paciente</th>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Hora</th>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Especialidad</th>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Médico</th>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Estado</th>
              </tr>
            </thead>
            <tbody>
              {appointments.filter(a => a.date === '2025-10-30').map(apt => (
                <tr key={apt.id} className="border-b border-gray-100 hover:bg-purple-50/50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">{apt.patientName}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">⏰ {apt.time}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{apt.type}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">👨‍⚕️ {apt.doctor}</td>
                  <td className="px-4 py-3">
                    <span className={'status-badge ' + (apt.status === 'Confirmada' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white')}>
                      {apt.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="glass-effect p-6 rounded-2xl shadow-lg border border-gray-200/50">
        <h3 className="text-xl font-bold mb-5 flex items-center bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
          <Activity className="mr-2 text-green-600" size={24} />
          Tratamientos Registrados Recientes
        </h3>
        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
          {treatments.slice(-10).reverse().map(trt => {
            const patient = patients.find(p => p.id === trt.patientId);
            return (
              <div key={trt.id} className="bg-white border-2 border-gray-100 p-4 rounded-xl hover:border-green-300 hover:shadow-md transition-all">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                  <div className="flex-1">
                    <p className="font-bold text-gray-800">{patient ? patient.name : 'Paciente desconocido'} • Hab. {patient?.room}</p>
                    <p className="text-sm text-gray-600 mt-1">💊 {trt.medication} - {trt.dose}</p>
                    <p className="text-sm text-gray-600">⏰ Frecuencia: {trt.frequency}</p>
                    {trt.notes && <p className="text-sm text-gray-500 mt-2 italic bg-gray-50 p-2 rounded">📝 {trt.notes}</p>}
                    <p className="text-xs text-gray-500 mt-2">👨‍⚕️ Aplicado por: {trt.appliedBy}</p>
                    <p className="text-xs text-gray-500">Última aplicación: {trt.lastApplication}</p>
                  </div>
                  <span className="px-2 md:px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold self-start">
                    Activo
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
    );
  };

  const PatientDashboard = () => {
    // Move patient-specific state here
    const [newAppointment, setNewAppointment] = useState({ patientName: '', date: '', time: '', type: '' });
    
    return (
    <div className="space-y-6 page-transition">
      <div className="glass-effect p-6 md:p-8 rounded-2xl shadow-lg border border-gray-200/50">
        <h3 className="text-2xl font-bold mb-6 flex items-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          <Calendar className="mr-3 text-blue-600" size={28} />
          Agendar Nueva Cita
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="👤 Nombre del paciente"
            className="px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm hover:shadow-md"
            value={newAppointment.patientName}
            onChange={(e) => setNewAppointment(prev => ({...prev, patientName: e.target.value}))}
          />
          <select
            className="px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm hover:shadow-md"
            value={newAppointment.type}
            onChange={(e) => setNewAppointment(prev => ({...prev, type: e.target.value}))}
          >
            <option value="">🏥 Seleccionar especialidad</option>
            {specialties.map((s, i) => <option key={i} value={s.name}>{s.name}</option>)}
          </select>
          <input
            type="date"
            className="px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm hover:shadow-md"
            value={newAppointment.date}
            onChange={(e) => setNewAppointment(prev => ({...prev, date: e.target.value}))}
          />
          <input
            type="time"
            className="px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm hover:shadow-md"
            value={newAppointment.time}
            onChange={(e) => setNewAppointment(prev => ({...prev, time: e.target.value}))}
          />
        </div>
        <button
          onClick={scheduleAppointment}
          className="mt-6 w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-bold text-lg shadow-lg hover:shadow-xl"
        >
          ✨ Agendar Cita
        </button>
      </div>

      <div className="glass-effect p-6 rounded-2xl shadow-lg border border-gray-200/50">
        <h3 className="text-xl font-bold mb-5 flex items-center bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
          <Clock className="mr-2 text-green-600" size={24} />
          Mis Citas
        </h3>
        <div className="space-y-3">
          {appointments.filter(a => a.patientId === currentUser.id).map(apt => (
            <div key={apt.id} className="bg-white border-2 border-gray-100 p-4 rounded-xl hover:border-green-300 hover:shadow-md transition-all">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <div>
                  <p className="font-bold text-gray-800">{apt.type}</p>
                  <p className="text-sm text-gray-600">📅 {apt.date} a las ⏰ {apt.time}</p>
                  <p className="text-sm text-gray-600">👨‍⚕️ Médico: {apt.doctor}</p>
                </div>
                <span className={'status-badge ' + (apt.status === 'Confirmada' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white')}>
                  {apt.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-effect p-6 rounded-2xl shadow-lg border border-gray-200/50">
        <h3 className="text-xl font-bold mb-5 flex items-center bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
          <FileText className="mr-2 text-blue-600" size={24} />
          Mi Historial Médico
        </h3>
        <div className="space-y-3">
          {medicalHistory.filter(h => h.patientId === currentUser.id).map(record => (
            <div key={record.id} className="bg-white border-2 border-gray-100 p-4 rounded-xl hover:border-blue-300 hover:shadow-md transition-all">
              <p className="font-bold text-lg text-gray-800">{record.diagnosis}</p>
              <p className="text-sm text-gray-600 mt-1">📅 Fecha: {record.date}</p>
              <p className="text-sm text-gray-600">💊 Tratamiento: {record.treatment}</p>
              <p className="text-sm text-gray-500 mt-2 bg-gray-50 p-3 rounded-lg italic">📝 {record.notes}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
        <h3 className="text-lg md:text-xl font-bold mb-4 flex items-center">
          <TestTube className="mr-2 text-green-600" size={20} />
          Resultados de Laboratorio
        </h3>
        <div className="space-y-3">
          {labTests.filter(t => t.patientId === currentUser.id).map(test => (
            <div key={test.id} className="border border-gray-200 p-3 md:p-4 rounded-lg">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <div>
                  <p className="font-semibold text-sm md:text-base text-gray-800">{test.test}</p>
                  <p className="text-xs md:text-sm text-gray-600">Fecha: {test.date}</p>
                  <p className="text-xs md:text-sm text-gray-600">Resultados: {test.results}</p>
                </div>
                <span className={'px-2 md:px-3 py-1 rounded-full text-xs font-semibold ' + (test.status === 'Completado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800')}>
                  {test.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
        <h3 className="text-lg md:text-xl font-bold mb-4 flex items-center">
          <Pill className="mr-2 text-blue-600" size={20} />
          Mis Tratamientos Activos
        </h3>
        <div className="space-y-3">
          {treatments.filter(t => t.patientId === currentUser.id).map(trt => (
            <div key={trt.id} className="border border-gray-200 p-3 md:p-4 rounded-lg">
              <p className="font-semibold text-sm md:text-base text-gray-800">{trt.medication} - {trt.dose}</p>
              <p className="text-xs md:text-sm text-gray-600">Frecuencia: {trt.frequency}</p>
              <p className="text-xs text-gray-500 mt-2">Última aplicación: {trt.lastApplication}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {currentUser && (
        <nav className="glass-effect border-b border-gray-200/50 sticky top-0 z-50 shadow-xl backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Top Bar */}
            <div className="flex justify-between items-center py-4">
              {/* Logo and Brand */}
              <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => setCurrentView('dashboard')}>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full blur-lg opacity-50 group-hover:opacity-70 transition"></div>
                  <Activity className="text-purple-600 relative" size={36} />
                </div>
                <div>
                  <h1 className="text-2xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent group-hover:from-purple-700 group-hover:to-blue-700 transition">
                    Hospital San Rafael
                  </h1>
                  <p className="text-xs text-gray-600 font-semibold">
                    {currentUser.type === 'nurse' ? '👨‍⚕️ Panel de Enfermería' : 
                     currentUser.type === 'admin' ? '⚡ Panel de Administración' :
                     currentUser.role === 'doctor' ? '🩺 Panel Médico' :
                     '👤 Portal del Paciente'}
                  </p>
                </div>
              </div>
              
              {/* Search Bar (Desktop) */}
              <div className="hidden lg:flex flex-1 max-w-2xl mx-8">
                <SearchBar onSearch={handleSearchResult} />
              </div>
              
              {/* User Info & Actions */}
              <div className="flex items-center gap-4">
                <NotificationCenter />
                
                {/* User Menu */}
                <div className="flex items-center gap-3 bg-gradient-to-r from-purple-50 to-blue-50 px-4 py-2.5 rounded-xl border border-purple-100">
                  <div className="text-right">
                    <p className="font-bold text-gray-800 text-sm">{currentUser.name}</p>
                    <p className="text-xs text-gray-600">
                      {currentUser.type === 'nurse' ? 'Enfermero' : 
                       currentUser.type === 'admin' ? 'Administrador' :
                       currentUser.role === 'doctor' ? 'Médico' :
                       'Paciente'}
                    </p>
                  </div>
                  <button
                    onClick={() => setCurrentView('profile')}
                    className="p-2 hover:bg-purple-100 rounded-lg transition"
                    title="Mi Perfil"
                  >
                    <User size={20} className="text-purple-600" />
                  </button>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="px-4 py-2.5 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:from-red-600 hover:to-pink-600 transition-all font-semibold shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  <LogOut size={18} />
                  <span className="hidden md:inline">Salir</span>
                </button>
              </div>
            </div>

            {/* Navigation Menu */}
            <div className="border-t border-gray-200/50 py-3">
              <div className="flex items-center justify-center gap-1 overflow-x-auto">
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
                    currentView === 'dashboard' 
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Activity size={18} />
                  <span>Dashboard</span>
                </button>

                <button
                  onClick={() => setCurrentView('calendar')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
                    currentView === 'calendar' 
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Calendar size={18} />
                  <span>Calendario</span>
                </button>

                <button
                  onClick={() => setCurrentView('pharmacy')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
                    currentView === 'pharmacy' 
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Pill size={18} />
                  <span>Farmacia</span>
                </button>

                <button
                  onClick={() => setCurrentView('emergency')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
                    currentView === 'emergency' 
                      ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <AlertCircle size={18} />
                  <span>Emergencias</span>
                </button>

                <button
                  onClick={() => setCurrentView('lab')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
                    currentView === 'lab' 
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <TestTube size={18} />
                  <span>Laboratorio</span>
                </button>

                <button
                  onClick={() => setCurrentView('radiology')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
                    currentView === 'radiology' 
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Scan size={18} />
                  <span>Radiología</span>
                </button>

                <button
                  onClick={() => setCurrentView('surgery')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
                    currentView === 'surgery' 
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Scissors size={18} />
                  <span>Cirugías</span>
                </button>

                <button
                  onClick={() => setCurrentView('messaging')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
                    currentView === 'messaging' 
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <MessageSquare size={18} />
                  <span>Mensajería</span>
                </button>

                <button
                  onClick={() => setCurrentView('reports')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
                    currentView === 'reports' 
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <BarChart3 size={18} />
                  <span>Reportes</span>
                </button>

                <button
                  onClick={() => setCurrentView('settings')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
                    currentView === 'settings' 
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Settings size={18} />
                  <span>Configuración</span>
                </button>
              </div>
            </div>
          </div>
        </nav>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <ErrorBoundary>
          {currentView === 'home' && <HomePage />}
          {currentView === 'login' && (
            <LoginForm 
              onLoginSuccess={(user) => {
                handleLoginSuccess(user);
              }}
              onBackToHome={() => {
                setCurrentView('home');
              }}
            />
          )}
          {currentView === 'register' && (
            <RegisterForm 
              onRegisterSuccess={() => {
                setCurrentView('login');
              }}
              onBackToHome={() => {
                setCurrentView('home');
              }}
            />
          )}
          {currentView === 'dashboard' && currentUser && (
            currentUser.type === 'admin' || currentUser.role === 'admin' ? <AdvancedDashboard currentUser={currentUser} /> :
            currentUser.role === 'doctor' ? <DoctorDashboard currentUser={currentUser} /> :
            currentUser.type === 'nurse' ? <NurseDashboard /> : 
            <PatientDashboard />
          )}
          {currentView === 'profile' && currentUser && (
            <UserProfile 
              currentUser={currentUser} 
              onUpdateUser={(updatedUser) => setCurrentUser(updatedUser)}
            />
          )}
          {currentView === 'calendar' && currentUser && <AppointmentCalendar currentUser={currentUser} />}
          {currentView === 'pharmacy' && currentUser && <PharmacyManagement currentUser={currentUser} />}
          {currentView === 'emergency' && currentUser && <EmergencyRoom currentUser={currentUser} />}
          {currentView === 'surgery' && currentUser && <SurgeryScheduling currentUser={currentUser} />}
          {currentView === 'messaging' && currentUser && <MessagingSystem currentUser={currentUser} />}
          {currentView === 'reports' && currentUser && <ReportsAnalytics currentUser={currentUser} />}
          {currentView === 'lab' && currentUser && <LabManagement currentUser={currentUser} />}
          {currentView === 'radiology' && currentUser && <RadiologyManagement currentUser={currentUser} />}
          {currentView === 'settings' && currentUser && <SettingsPage currentUser={currentUser} />}
          {currentView === 'patientDetails' && currentUser && currentUser.type === 'nurse' && <PatientDetailsView />}
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default HospitalManagementSystem;