import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, User, FileText, Activity, Users, Pill, 
  LogOut, Heart, Stethoscope, AlertCircle, CheckCircle, 
  Menu, X, LayoutDashboard, Syringe, ClipboardList, ChevronRight, Save, Building2 
} from 'lucide-react';
import { usePatients, useAppointments, useTreatments, useVitalSigns, useNurseNotes, initializeApp } from './hooks/useDatabase';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';

// --- COMPONENTES UI REUTILIZABLES (Tarjetas, Encabezados) ---

// Tarjeta de Estadísticas del Dashboard
const StatCard = ({ title, value, icon: Icon, colorName, subtext }) => {
  const colors = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', ring: 'ring-blue-100' },
    red: { bg: 'bg-red-50', text: 'text-red-600', ring: 'ring-red-100' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-100' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', ring: 'ring-purple-100' },
  };
  const theme = colors[colorName] || colors.blue;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-card border border-hospital-100 flex items-start justify-between transition-all hover:shadow-md">
      <div>
        <p className="text-hospital-500 text-sm font-semibold uppercase tracking-wider">{title}</p>
        <h3 className="text-3xl font-extrabold text-hospital-800 mt-2">{value}</h3>
        {subtext && <p className="text-xs text-hospital-500 mt-1 font-medium flex items-center gap-1"><span className={`inline-block w-2 h-2 rounded-full ${theme.bg} ${theme.ring} ring-2`}></span> {subtext}</p>}
      </div>
      <div className={`p-4 rounded-xl ${theme.bg} ${theme.text}`}>
        <Icon size={28} strokeWidth={1.5} />
      </div>
    </div>
  );
};

// Encabezado de Sección con Icono
const SectionHeader = ({ icon: Icon, title, subtitle }) => (
  <div className="mb-6 flex items-start gap-3">
    <div className="p-2 bg-clinical-light rounded-lg text-clinical-primary">
      <Icon size={24} />
    </div>
    <div>
      <h2 className="text-xl font-bold text-hospital-800">{title}</h2>
      {subtitle && <p className="text-hospital-500 text-sm">{subtitle}</p>}
    </div>
  </div>
);

// --- DASHBOARD PRINCIPAL DE ENFERMERÍA ---

const NurseDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Hooks de Base de Datos (Tu lógica original intacta)
  const { patients, updatePatient, loading: patientsLoading } = usePatients();
  const { appointments } = useAppointments();
  const { treatments, addTreatment: addTreatmentDB } = useTreatments();
  const { vitalSigns, addVitalSigns: addVitalSignsDB } = useVitalSigns();
  const { nurseNotes, addNurseNote: addNurseNoteDB } = useNurseNotes();

  // Estados locales para formularios
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [newVitalSigns, setNewVitalSigns] = useState({ temperature: '', bloodPressure: '', heartRate: '', respiratoryRate: '' });
  const [newMedication, setNewMedication] = useState({ medication: '', dose: '', frequency: '', notes: '' });
  const [newNote, setNewNote] = useState('');
  const [newCondition, setNewCondition] = useState('');

  // --- Manejadores de Formularios (Tu lógica original) ---

  const handleVitalSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPatientId) return alert("⚠️ Por favor seleccione un paciente primero.");
    const now = new Date();
    try {
      await addVitalSignsDB({
        patient_id: parseInt(selectedPatientId),
        date: now.toLocaleString('es-MX'),
        temperature: newVitalSigns.temperature,
        blood_pressure: newVitalSigns.bloodPressure,
        heart_rate: newVitalSigns.heartRate,
        respiratory_rate: newVitalSigns.respiratoryRate,
        registered_by: user.name
      });
      alert("✅ Signos vitales registrados.");
      setNewVitalSigns({ temperature: '', bloodPressure: '', heartRate: '', respiratoryRate: '' });
    } catch (error) { console.error(error); alert("Error al registrar: " + error.message); }
  };

  const handleMedicationSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPatientId) return alert("⚠️ Seleccione un paciente.");
    const now = new Date();
    try {
      await addTreatmentDB({
        patientId: parseInt(selectedPatientId),
        ...newMedication,
        startDate: now.toLocaleDateString(),
        appliedBy: user.name,
        lastApplication: now.toLocaleString(),
      });
      alert("✅ Medicamento registrado.");
      setNewMedication({ medication: '', dose: '', frequency: '', notes: '' });
    } catch (error) { alert("Error al registrar medicamento."); }
  };

  const handleNoteSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPatientId || !newNote) return;
    try {
      await addNurseNoteDB({
        patientId: parseInt(selectedPatientId),
        date: new Date().toLocaleString(),
        note: newNote,
        nurseName: user.name
      });
      setNewNote('');
      alert("✅ Nota guardada.");
    } catch (error) { alert("Error al guardar nota."); }
  };

  const handleConditionUpdate = async () => {
    if (!selectedPatientId || !newCondition) return;
    const patient = patients.find(p => p.id == selectedPatientId);
    if (!patient) return;
    try {
      await updatePatient(patient.id, { ...patient, condition: newCondition });
      alert(`✅ Estado actualizado a: ${newCondition}`);
    } catch (error) { console.error(error); alert("Error al actualizar estado."); }
  };

  // --- Vistas de Contenido ---

  const OverviewView = () => (
    <div className="space-y-8 animate-fadeIn">
      {/* Tarjetas de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Pacientes Asignados" value={patients.length} icon={Users} colorName="blue" subtext="Total en planta" />
        <StatCard title="Atención Prioritaria" value={patients.filter(p => p.condition === 'Crítico').length} icon={AlertCircle} colorName="red" subtext="Estado Crítico" />
        <StatCard title="Tratamientos Activos" value={treatments.length} icon={Pill} colorName="emerald" subtext="En curso" />
        <StatCard title="Citas de Hoy" value={appointments.filter(a => a.date === new Date().toISOString().split('T')[0]).length} icon={Calendar} colorName="purple" subtext="Programadas" />
      </div>

      {/* Sección de Actividad Reciente (Rediseñada como línea de tiempo) */}
      <div className="bg-white rounded-2xl shadow-card border border-hospital-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-hospital-100 flex items-center justify-between bg-hospital-50/50">
          <h3 className="font-bold text-hospital-800 flex items-center gap-2 text-lg">
            <Clock size={20} className="text-clinical-primary" />
            Últimos Movimientos y Notas
          </h3>
        </div>
        <div className="p-6">
          {nurseNotes.length > 0 ? (
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:ml-[8.75rem] md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-hospital-200 before:to-transparent">
              {nurseNotes.slice(0, 5).map((note, idx) => {
                 const pt = patients.find(p => p.id === note.patientId);
                 return (
                  <div key={idx} className="relative flex items-start group md:ml-32">
                    {/* Icono en la línea de tiempo */}
                    <div className="absolute -left-2 md:-left-10 bg-white p-1 rounded-full border-2 border-purple-100 z-10">
                        <div className="bg-purple-50 p-1.5 rounded-full text-purple-600">
                            <FileText size={14} />
                        </div>
                    </div>
                    
                    <div className="ml-10 md:ml-0 bg-white p-4 rounded-xl border border-hospital-100 shadow-sm w-full group-hover:shadow-md transition-all">
                      <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-hospital-800 flex items-center gap-2">
                              Nota sobre {pt ? pt.name : 'Paciente'}
                          </h4>
                          <span className="text-xs font-medium text-hospital-400 bg-hospital-50 px-2 py-1 rounded-full">{note.date}</span>
                      </div>
                      <p className="text-sm text-hospital-600 italic border-l-4 border-purple-200 pl-3 my-2">"{note.note}"</p>
                      <p className="text-xs text-hospital-500 font-medium flex items-center gap-1 mt-3">
                        <User size={12} /> Registrado por: {note.nurseName}
                      </p>
                    </div>
                  </div>
                 )
              })}
            </div>
          ) : <div className="text-center py-10 text-hospital-400 flex flex-col items-center gap-2"><ClipboardList size={40} opacity={0.5}/>No hay actividad reciente.</div>}
        </div>
      </div>
    </div>
  );

  const PatientsListView = () => (
    <div className="bg-white rounded-2xl shadow-card border border-hospital-100 overflow-hidden animate-fadeIn">
      <div className="px-6 py-5 border-b border-hospital-100 flex items-center justify-between bg-hospital-50/50">
        <h3 className="font-bold text-hospital-800 flex items-center gap-2 text-lg">
            <Users size={20} className="text-clinical-primary" />
            Directorio de Pacientes
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-hospital-50/70">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-hospital-500 uppercase tracking-widerFirst">Paciente</th>
              <th className="px-6 py-4 text-xs font-bold text-hospital-500 uppercase tracking-wider">Ubicación</th>
              <th className="px-6 py-4 text-xs font-bold text-hospital-500 uppercase tracking-wider">Info. Médica</th>
              <th className="px-6 py-4 text-xs font-bold text-hospital-500 uppercase tracking-wider">Estado Actual</th>
              <th className="px-6 py-4 text-xs font-bold text-hospital-500 uppercase tracking-wider text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hospital-100">
            {patients.map((patient) => {
               const statusColors = {
                'Crítico': 'bg-red-50 text-red-700 border-red-100',
                'Estable': 'bg-emerald-50 text-emerald-700 border-emerald-100',
                'Recuperación': 'bg-blue-50 text-blue-700 border-blue-100',
               };
               const statusClass = statusColors[patient.condition] || 'bg-gray-50 text-gray-700 border-gray-100';
               
               return (
              <tr key={patient.id} className="hover:bg-hospital-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-clinical-light text-clinical-primary flex items-center justify-center font-bold text-lg">
                        {patient.name.charAt(0)}
                    </div>
                    <div>
                        <div className="font-bold text-hospital-800">{patient.name}</div>
                        <div className="text-xs text-hospital-500">ID: #{patient.id.toString().padStart(4, '0')}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-hospital-700 font-medium">
                    <Building2 size={16} className="text-hospital-400" /> Hab. {patient.room}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-hospital-600">
                    <span className="font-medium">{patient.age} años</span> • Tipo {patient.bloodType}
                  </div>
                  {patient.allergies && <div className="text-xs text-red-600 mt-1 font-medium flex items-center gap-1"><AlertCircle size={12}/> Alergias: {patient.allergies}</div>}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusClass} inline-flex items-center gap-1`}>
                    <div className={`w-2 h-2 rounded-full ${statusClass.replace('bg-', 'bg-').replace('text-', '').split(' ')[0].replace('50', '500')}`}></div>
                    {patient.condition}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => { setSelectedPatientId(patient.id); setActiveTab('care'); }}
                    className="inline-flex items-center gap-1 px-4 py-2 bg-clinical-primary text-white text-sm font-bold rounded-xl hover:bg-clinical-dark transition shadow-sm hover:shadow group-hover:translate-x-1 duration-200"
                  >
                    Gestionar Cuidados <ChevronRight size={16} />
                  </button>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>
    </div>
  );

  const CareView = () => {
    const selectedPatient = patients.find(p => p.id == selectedPatientId);
    
    return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-fadeIn items-start">
      {/* COLUMNA IZQUIERDA: Resumen del Paciente (Sticky) */}
      <div className="xl:col-span-1 space-y-6 xl:sticky xl:top-24">
        {/* Tarjeta de Selección y Resumen */}
        <div className="bg-white p-6 rounded-2xl shadow-card border border-hospital-100">
          <h3 className="text-lg font-bold text-hospital-800 mb-4 flex items-center gap-2">
            <User className="text-clinical-primary" /> Selección de Paciente
          </h3>
          
          <div className="relative">
            <select 
              className="w-full p-3 pl-10 bg-hospital-50 border border-hospital-200 rounded-xl appearance-none focus:ring-2 focus:ring-clinical-primary outline-none transition font-medium text-hospital-700"
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
            >
              <option value="">-- Seleccionar Paciente --</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <ChevronRight className="absolute right-3 top-3.5 text-hospital-400 rotate-90" size={20} />
            <Users className="absolute left-3 top-3.5 text-hospital-400" size={20} />
          </div>

          {selectedPatient ? (
            <div className="mt-6 animate-fadeIn">
              <div className="p-5 bg-clinical-light/50 rounded-2xl border border-clinical-light mb-4">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-clinical-primary text-white flex items-center justify-center font-bold text-2xl shadow-sm">
                        {selectedPatient.name.charAt(0)}
                    </div>
                    <div>
                        <h4 className="font-bold text-hospital-800 text-xl leading-tight">{selectedPatient.name}</h4>
                        <p className="text-hospital-500 text-sm flex items-center gap-2 mt-1">
                            <Building2 size={14}/> Habitación {selectedPatient.room}
                        </p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm border-t border-blue-100/50 pt-4">
                  <div className="bg-white p-3 rounded-xl border border-hospital-100">
                    <span className="text-hospital-400 text-xs font-bold uppercase block mb-1">Edad / Sangre</span>
                    <span className="text-hospital-800 font-bold">{selectedPatient.age} años, {selectedPatient.bloodType}</span>
                  </div>
                  <div className={`p-3 rounded-xl border ${selectedPatient.allergies ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'}`}>
                     <span className={`text-xs font-bold uppercase block mb-1 ${selectedPatient.allergies ? 'text-red-600' : 'text-emerald-600'}`}>Alergias</span>
                     <span className={`font-bold ${selectedPatient.allergies ? 'text-red-700' : 'text-emerald-700'} flex items-center gap-1`}>
                        {selectedPatient.allergies ? <><AlertCircle size={14}/> {selectedPatient.allergies}</> : <><CheckCircle size={14}/> Ninguna</>}
                     </span>
                  </div>
                </div>
              </div>

              {/* Actualizar Estado */}
              <div className="p-4 bg-white border-2 border-hospital-100 rounded-2xl">
                <label className="block text-xs font-bold text-hospital-500 uppercase mb-2">Actualizar Condición Clínica</label>
                <div className="flex gap-2">
                  <select 
                    className="flex-1 p-2.5 bg-hospital-50 border border-hospital-200 rounded-xl text-sm font-medium outline-none focus:border-clinical-primary transition"
                    value={newCondition || selectedPatient.condition}
                    onChange={(e) => setNewCondition(e.target.value)}
                  >
                    <option value="Estable">🟢 Estable</option>
                    <option value="Crítico">🔴 Crítico</option>
                    <option value="Recuperación">🔵 Recuperación</option>
                    <option value="Observación">🟡 Observación</option>
                  </select>
                  <button onClick={handleConditionUpdate} className="bg-hospital-800 text-white p-2.5 rounded-xl hover:bg-hospital-900 transition shadow-sm">
                    <Save size={20} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-6 p-8 border-2 border-dashed border-hospital-200 rounded-2xl text-center bg-hospital-50/50">
                <User size={40} className="text-hospital-300 mx-auto mb-2" />
                <p className="text-hospital-500 font-medium">Seleccione un paciente para habilitar las acciones de cuidado.</p>
            </div>
          )}
        </div>
      </div>

      {/* COLUMNA DERECHA: Formularios de Acción (Solo visibles si hay paciente) */}
      {selectedPatient && (
        <div className="xl:col-span-2 space-y-6">
          {/* Tarjeta de Signos Vitales */}
          <div className="bg-white rounded-2xl shadow-card border border-hospital-100 overflow-hidden relative">
             <div className="absolute top-0 left-0 w-2 h-full bg-clinical-primary"></div>
            <div className="p-6 border-b border-hospital-100 bg-hospital-50/30">
              <h3 className="text-lg font-bold text-hospital-800 flex items-center gap-2">
                <Activity className="text-clinical-primary" /> Registro de Signos Vitales
              </h3>
            </div>
            <form onSubmit={handleVitalSubmit} className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                {[
                  { label: 'Temperatura (°C)', name: 'temperature', icon: <Heart size={16} className="text-red-400"/>, placeholder: '36.5' },
                  { label: 'Presión Arterial', name: 'bloodPressure', icon: <Activity size={16} className="text-blue-400"/>, placeholder: '120/80' },
                  { label: 'Frec. Cardíaca (LPM)', name: 'heartRate', icon: <Heart size={16} className="text-red-400"/>, placeholder: '80' },
                  { label: 'Frec. Respiratoria', name: 'respiratoryRate', icon: <Activity size={16} className="text-blue-400"/>, placeholder: '18' }
                ].map(field => (
                  <div key={field.name} className="bg-hospital-50 p-3 rounded-xl border border-hospital-100 focus-within:border-clinical-primary focus-within:ring-2 ring-clinical-light transition-all">
                    <label className="text-xs font-bold text-hospital-500 mb-1 flex items-center gap-1">{field.icon} {field.label}</label>
                    <input 
                        type="text" 
                        required 
                        placeholder={field.placeholder} 
                        className="w-full bg-transparent font-bold text-hospital-800 outline-none placeholder:text-hospital-300 placeholder:font-normal"
                        value={newVitalSigns[field.name]} 
                        onChange={e => setNewVitalSigns({...newVitalSigns, [field.name]: e.target.value})} 
                    />
                  </div>
                ))}
              </div>
              <button type="submit" className="mt-6 w-full md:w-auto px-6 py-3 bg-clinical-primary text-white rounded-xl hover:bg-clinical-dark transition font-bold shadow-md shadow-blue-100 flex items-center justify-center gap-2 ml-auto">
                <Save size={18} /> Guardar Signos
              </button>
            </form>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tarjeta de Medicación */}
            <div className="bg-white rounded-2xl shadow-card border border-hospital-100 overflow-hidden relative">
               <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500"></div>
              <div className="p-5 border-b border-hospital-100 bg-hospital-50/30">
                <h3 className="text-lg font-bold text-hospital-800 flex items-center gap-2">
                  <Syringe className="text-emerald-500" /> Administración de Medicamento
                </h3>
              </div>
              <form onSubmit={handleMedicationSubmit} className="p-5 space-y-4">
                <div>
                    <input type="text" required placeholder="Nombre del Medicamento" className="w-full p-3 bg-hospital-50 border border-hospital-200 rounded-xl outline-none focus:border-emerald-500 transition font-medium"
                    value={newMedication.medication} onChange={e => setNewMedication({...newMedication, medication: e.target.value})} />
                </div>
                <div className="flex gap-3">
                  <input type="text" required placeholder="Dosis (ej. 500mg)" className="flex-1 p-3 bg-hospital-50 border border-hospital-200 rounded-xl outline-none focus:border-emerald-500 transition font-medium"
                    value={newMedication.dose} onChange={e => setNewMedication({...newMedication, dose: e.target.value})} />
                  <input type="text" required placeholder="Frecuencia" className="flex-1 p-3 bg-hospital-50 border border-hospital-200 rounded-xl outline-none focus:border-emerald-500 transition font-medium"
                    value={newMedication.frequency} onChange={e => setNewMedication({...newMedication, frequency: e.target.value})} />
                </div>
                <button type="submit" className="w-full py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition font-bold shadow-md shadow-emerald-100 flex items-center justify-center gap-2">
                  <CheckCircle size={18} /> Registrar Aplicación
                </button>
              </form>
            </div>

            {/* Tarjeta de Notas */}
            <div className="bg-white rounded-2xl shadow-card border border-hospital-100 overflow-hidden relative flex flex-col">
               <div className="absolute top-0 left-0 w-2 h-full bg-purple-500"></div>
              <div className="p-5 border-b border-hospital-100 bg-hospital-50/30">
                <h3 className="text-lg font-bold text-hospital-800 flex items-center gap-2">
                  <ClipboardList className="text-purple-500" /> Nota de Evolución / Reporte
                </h3>
              </div>
              <form onSubmit={handleNoteSubmit} className="p-5 flex-1 flex flex-col">
                <textarea required rows="4" placeholder="Escriba observaciones, cambios en el paciente, etc..." 
                  className="w-full p-3 bg-hospital-50 border border-hospital-200 rounded-xl outline-none focus:border-purple-500 transition font-medium resize-none flex-1 mb-4"
                  value={newNote} onChange={e => setNewNote(e.target.value)}></textarea>
                <button type="submit" className="w-full py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition font-bold shadow-md shadow-purple-100 flex items-center justify-center gap-2 mt-auto">
                  <FileText size={18} /> Guardar Nota
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );};

  // --- RENDERIZADO PRINCIPAL CON NUEVO LAYOUT (Sidebar + Contenido) ---
  return (
    <div className="flex h-screen bg-hospital-50 overflow-hidden">
      {/* SIDEBAR DE NAVEGACIÓN (Rediseñado) */}
      <aside className={`${sidebarOpen ? 'w-72' : 'w-24'} bg-hospital-800 transition-all duration-300 flex flex-col z-20 shadow-xl relative`}>
        <div className="p-6 flex items-center justify-between mb-6">
          {sidebarOpen ? (
            <div className="flex items-center gap-3 animate-fadeIn">
                <div className="bg-clinical-primary p-2 rounded-xl shadow-lg shadow-blue-900/50">
                    <Activity className="text-white" size={24} />
                </div>
                <div>
                    <h1 className="text-xl font-black text-white tracking-tight leading-none">San Rafael</h1>
                    <span className="text-xs text-hospital-300 font-medium">Gestión Clínica</span>
                </div>
            </div>
          ) : (
             <div className="bg-clinical-primary p-2 rounded-xl shadow-lg shadow-blue-900/50 mx-auto">
                <Activity className="text-white" size={24} />
            </div>
          )}
        </div>
        
        {/* Botón Toggle Sidebar (Flotante) */}
         <button onClick={() => setSidebarOpen(!sidebarOpen)} className="absolute -right-4 top-20 bg-white text-hospital-800 p-1.5 rounded-full shadow-md border border-hospital-100 hover:bg-hospital-50 transition z-30 hidden md:block">
            {sidebarOpen ? <ChevronRight size={16} className="rotate-180"/> : <ChevronRight size={16} />}
          </button>

        <nav className="flex-1 px-4 space-y-3">
          {[
            { id: 'overview', label: 'Panel General', icon: LayoutDashboard },
            { id: 'patients', label: 'Lista de Pacientes', icon: Users },
            { id: 'care', label: 'Zona de Cuidados', icon: Stethoscope },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all font-bold text-sm relative group ${
                activeTab === item.id 
                  ? 'bg-clinical-primary text-white shadow-lg shadow-blue-900/20' 
                  : 'text-hospital-300 hover:bg-hospital-700 hover:text-white'
              }`}
            >
              <item.icon size={22} />
              <span className={`${!sidebarOpen && 'hidden'} transition-opacity whitespace-nowrap`}>{item.label}</span>
              {!sidebarOpen && activeTab !== item.id && (
                 <div className="absolute left-full ml-4 bg-hospital-900 text-white px-3 py-2 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-xl z-50 text-xs font-bold">
                    {item.label}
                 </div>
              )}
            </button>
          ))}
        </nav>

        {/* Perfil de Usuario en Sidebar */}
        <div className="p-4 m-4 bg-hospital-700/50 rounded-2xl border border-hospital-600/30">
          <div className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center'}`}>
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-clinical-primary to-clinical-dark text-white flex items-center justify-center font-bold shadow-md ring-2 ring-hospital-600 ring-offset-2 ring-offset-hospital-800 text-lg">
              {user.name.charAt(0)}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0 animate-fadeIn">
                <p className="text-sm font-bold text-white truncate">{user.name}</p>
                <p className="text-xs text-hospital-300 bg-hospital-800 inline-block px-2 py-0.5 rounded-full mt-1">Enfermería</p>
              </div>
            )}
          </div>
          <button onClick={onLogout} className={`mt-4 w-full flex items-center justify-center gap-2 p-2.5 rounded-xl text-red-300 hover:bg-red-500/10 hover:text-red-200 transition-colors border border-transparent hover:border-red-500/20 ${!sidebarOpen && 'px-0'}`}>
            <LogOut size={20} />
            {sidebarOpen && <span className="text-sm font-bold">Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* ÁREA DE CONTENIDO PRINCIPAL */}
      <main className="flex-1 overflow-y-auto relative flex flex-col">
        {/* Header Superior (Sticky) */}
        <header className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-hospital-100 z-10 px-8 py-5 flex justify-between items-center shadow-sm">
          <div>
            <h1 className="text-2xl font-black text-hospital-800 tracking-tight">
              {activeTab === 'overview' && 'Visión General'}
              {activeTab === 'patients' && 'Directorio de Pacientes'}
              {activeTab === 'care' && 'Gestión y Cuidados'}
            </h1>
            <p className="text-hospital-500 text-sm font-medium mt-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Sistema Hospitalario Activo
            </p>
          </div>
          <div className="hidden md:flex items-center gap-4">
              <div className="text-right hidden lg:block">
                <p className="text-sm font-bold text-hospital-800">{new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
             <button className="bg-hospital-50 p-2 rounded-full text-hospital-500 hover:bg-hospital-100 transition relative md:hidden">
                <Menu size={24} />
             </button>
          </div>
        </header>

        {/* Contenedor de Vistas */}
        <div className="p-6 md:p-8 flex-1 bg-hospital-50/50">
          {patientsLoading ? (
            <div className="flex h-full items-center justify-center flex-col gap-6">
              <div className="relative">
                 <div className="w-20 h-20 border-4 border-hospital-200 rounded-full"></div>
                 <div className="w-20 h-20 border-4 border-clinical-primary rounded-full animate-spin absolute top-0 left-0 border-t-transparent"></div>
                 <Activity className="text-clinical-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" size={28}/>
              </div>
              <p className="text-hospital-500 font-medium animate-pulse">Cargando datos del sistema...</p>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && <OverviewView />}
              {activeTab === 'patients' && <PatientsListView />}
              {activeTab === 'care' && <CareView />}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL (Entry Point) ---
const HospitalManagementSystem = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(true); // Iniciar con login visible
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [appInitialized, setAppInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      try { await initializeApp(); setAppInitialized(true); } 
      catch (err) { console.error("Error iniciando app:", err); }
    };
    init();
  }, []);

  if (!appInitialized) return <div className="h-screen flex items-center justify-center bg-hospital-50 text-hospital-500 font-medium">Iniciando servicios...</div>;

  return (
    <div className="font-sans bg-hospital-50 min-h-screen">
      {!currentUser ? (
        <>
          {/* Pantalla de fondo mientras se muestra el modal de login */}
          <div className="fixed inset-0 bg-hospital-900/30 backdrop-blur-sm z-40"></div>
          {showLoginModal && (
            <LoginForm 
              onLoginSuccess={(user) => { setCurrentUser({...user, type: user.role === 'nurse' ? 'nurse' : 'other'}); setShowLoginModal(false); }}
              // Si quisieras una landing page, aquí iría la lógica para cerrarlo
              onBackToHome={() => {}} 
              onShowRegister={() => { setShowLoginModal(false); setShowRegisterModal(true); }}
            />
          )}
          {showRegisterModal && (
            <RegisterForm 
              onRegisterSuccess={() => { setShowRegisterModal(false); setShowLoginModal(true); }}
              onBackToHome={() => { setShowRegisterModal(false); setShowLoginModal(true); }}
            />
          )}
        </>
      ) : (
        currentUser.type === 'nurse' 
          ? <NurseDashboard user={currentUser} onLogout={() => setCurrentUser(null)} />
          : <div className="min-h-screen flex items-center justify-center flex-col gap-4">
              <h2 className="text-2xl font-bold text-hospital-800">Acceso Restringido</h2>
              <p className="text-hospital-600">Este portal es exclusivo para personal de enfermería.</p>
              <button onClick={() => setCurrentUser(null)} className="text-clinical-primary font-bold hover:underline">Cerrar Sesión</button>
            </div>
      )}
    </div>
  );
};

export default HospitalManagementSystem;
