import Database from '@tauri-apps/plugin-sql';

let db = null;

// Initialize database connection
export async function initDatabase() {
  if (db) return db;
  
  try {
    // Create or connect to SQLite database
    console.log('Initializing SQLite database...');
    db = await Database.load('sqlite:hospital.db');
    console.log('Database loaded successfully');
    
    // Create tables if they don't exist
    await createTables();
    
    return db;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw new Error(`Database initialization failed: ${error.message || error}`);
  }
}

// Create all database tables
async function createTables() {
  try {
    console.log('Creating database tables...');
    
    // Patients table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS patients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        age INTEGER NOT NULL,
        gender TEXT,
        room TEXT NOT NULL,
        floor TEXT DEFAULT '1',
        area TEXT DEFAULT 'General',
        bed TEXT DEFAULT 'A',
        condition TEXT NOT NULL,
        triage_level INTEGER DEFAULT 3,
        admission_date TEXT NOT NULL,
        blood_type TEXT NOT NULL,
        allergies TEXT,
        emergency_contact_name TEXT,
        emergency_contact_phone TEXT,
        address TEXT,
        city TEXT,
        insurance_provider TEXT,
        insurance_number TEXT,
        primary_doctor TEXT,
        discharge_date TEXT,
        status TEXT DEFAULT 'Active',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Patients table created');

    // Patient transfers table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS patient_transfers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        from_floor TEXT,
        from_area TEXT,
        from_room TEXT,
        from_bed TEXT,
        to_floor TEXT NOT NULL,
        to_area TEXT NOT NULL,
        to_room TEXT NOT NULL,
        to_bed TEXT NOT NULL,
        transfer_date TEXT NOT NULL,
        transfer_time TEXT NOT NULL,
        reason TEXT,
        transferred_by TEXT NOT NULL,
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id)
      )
    `);
    console.log('✓ Patient transfers table created');

    // Users table for authentication
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT UNIQUE,
        phone TEXT,
        profile_photo TEXT,
        bio TEXT,
        department TEXT,
        specialization TEXT,
        license_number TEXT,
        is_active INTEGER DEFAULT 1,
        last_login TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Users table created');

    // Appointments table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER,
        patient_name TEXT NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        type TEXT NOT NULL,
        status TEXT NOT NULL,
        doctor TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id)
      )
    `);
    console.log('✓ Appointments table created');

  // Treatments table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS treatments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      medication TEXT NOT NULL,
      dose TEXT NOT NULL,
      frequency TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT,
      applied_by TEXT NOT NULL,
      last_application TEXT NOT NULL,
      responsible_doctor TEXT,
      administration_times TEXT,
      status TEXT DEFAULT 'Activo',
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients(id)
    )
  `);

  // Vital signs table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS vital_signs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      temperature TEXT NOT NULL,
      blood_pressure TEXT NOT NULL,
      heart_rate TEXT NOT NULL,
      respiratory_rate TEXT NOT NULL,
      registered_by TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients(id)
    )
  `);

  // Lab tests table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS lab_tests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      test TEXT NOT NULL,
      date TEXT NOT NULL,
      status TEXT NOT NULL,
      results TEXT,
      ordered_by TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients(id)
    )
  `);

  // Medical history table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS medical_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      diagnosis TEXT NOT NULL,
      treatment TEXT NOT NULL,
      notes TEXT,
      doctor TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients(id)
    )
  `);

  // Nurse notes table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS nurse_notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      note TEXT NOT NULL,
      note_type TEXT DEFAULT 'evolutiva',
      nurse_name TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients(id)
    )
  `);

  // Non-pharmacological treatments table (curaciones, nebulizaciones, fluidoterapia, etc.)
  await db.execute(`
    CREATE TABLE IF NOT EXISTS non_pharmacological_treatments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      treatment_type TEXT NOT NULL,
      description TEXT NOT NULL,
      application_date TEXT NOT NULL,
      application_time TEXT,
      duration TEXT,
      performed_by TEXT NOT NULL,
      materials_used TEXT,
      observations TEXT,
      outcome TEXT,
      next_application TEXT,
      status TEXT DEFAULT 'Completado',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients(id)
    )
  `);
  console.log('✓ Non-pharmacological treatments table created');

  // Nursing shift reports table (hoja de enfermería digital)
  await db.execute(`
    CREATE TABLE IF NOT EXISTS nursing_shift_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      shift_date TEXT NOT NULL,
      shift_type TEXT NOT NULL,
      nurse_id INTEGER NOT NULL,
      nurse_name TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT,
      patients_assigned TEXT NOT NULL,
      general_observations TEXT,
      incidents TEXT,
      pending_tasks TEXT,
      handover_notes TEXT,
      supervisor_name TEXT,
      status TEXT DEFAULT 'En Curso',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (nurse_id) REFERENCES users(id)
    )
  `);
  console.log('✓ Nursing shift reports table created');

  // Notifications table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL,
      priority TEXT DEFAULT 'normal',
      is_read INTEGER DEFAULT 0,
      link TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Rooms table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS rooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_number TEXT UNIQUE NOT NULL,
      floor INTEGER NOT NULL,
      department TEXT NOT NULL,
      room_type TEXT NOT NULL,
      bed_count INTEGER NOT NULL,
      occupied_beds INTEGER DEFAULT 0,
      status TEXT DEFAULT 'Available',
      equipment TEXT,
      daily_rate REAL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Prescriptions table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS prescriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      doctor_id INTEGER NOT NULL,
      medication_name TEXT NOT NULL,
      dosage TEXT NOT NULL,
      frequency TEXT NOT NULL,
      duration TEXT NOT NULL,
      instructions TEXT,
      prescribed_date TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT,
      status TEXT DEFAULT 'Active',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients(id),
      FOREIGN KEY (doctor_id) REFERENCES users(id)
    )
  `);

  // Billing/Invoices table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS invoices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      invoice_number TEXT UNIQUE NOT NULL,
      invoice_date TEXT NOT NULL,
      due_date TEXT NOT NULL,
      subtotal REAL NOT NULL,
      tax REAL DEFAULT 0,
      discount REAL DEFAULT 0,
      total REAL NOT NULL,
      amount_paid REAL DEFAULT 0,
      status TEXT DEFAULT 'Pending',
      payment_method TEXT,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients(id)
    )
  `);

  // Invoice line items table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS invoice_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_id INTEGER NOT NULL,
      description TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      total REAL NOT NULL,
      item_type TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (invoice_id) REFERENCES invoices(id)
    )
  `);

  // Pharmacy inventory table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS pharmacy_inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      medication_name TEXT NOT NULL,
      generic_name TEXT,
      category TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unit TEXT NOT NULL,
      reorder_level INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      supplier TEXT,
      batch_number TEXT,
      manufacture_date TEXT,
      expiry_date TEXT NOT NULL,
      storage_location TEXT,
      status TEXT DEFAULT 'Available',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Emergency cases table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS emergency_cases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_name TEXT NOT NULL,
      age INTEGER,
      gender TEXT,
      arrival_time TEXT NOT NULL,
      triage_level INTEGER NOT NULL,
      chief_complaint TEXT NOT NULL,
      vital_signs TEXT,
      assigned_to TEXT,
      status TEXT DEFAULT 'Waiting',
      emergency_contact TEXT,
      ambulance_arrival INTEGER DEFAULT 0,
      outcome TEXT,
      discharge_time TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Surgery scheduling table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS surgeries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      procedure_name TEXT NOT NULL,
      scheduled_date TEXT NOT NULL,
      scheduled_time TEXT NOT NULL,
      duration INTEGER NOT NULL,
      operating_room TEXT NOT NULL,
      surgeon_id INTEGER NOT NULL,
      anesthesiologist_id INTEGER,
      nurses TEXT,
      status TEXT DEFAULT 'Scheduled',
      pre_op_notes TEXT,
      post_op_notes TEXT,
      complications TEXT,
      completed_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients(id),
      FOREIGN KEY (surgeon_id) REFERENCES users(id)
    )
  `);

  // Imaging/Radiology table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS imaging_tests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      test_type TEXT NOT NULL,
      body_part TEXT NOT NULL,
      ordered_by INTEGER NOT NULL,
      ordered_date TEXT NOT NULL,
      scheduled_date TEXT,
      performed_date TEXT,
      radiologist_id INTEGER,
      priority TEXT DEFAULT 'Routine',
      status TEXT DEFAULT 'Ordered',
      findings TEXT,
      impression TEXT,
      images_path TEXT,
      report_url TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients(id),
      FOREIGN KEY (ordered_by) REFERENCES users(id)
    )
  `);

  // Staff shifts table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS shifts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      shift_type TEXT NOT NULL,
      department TEXT NOT NULL,
      status TEXT DEFAULT 'Scheduled',
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Audit log table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      action TEXT NOT NULL,
      table_name TEXT NOT NULL,
      record_id INTEGER,
      old_value TEXT,
      new_value TEXT,
      ip_address TEXT,
      timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Password reset tokens table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at TEXT NOT NULL,
      used INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Vaccinations table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS vaccinations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      vaccine_name TEXT NOT NULL,
      dose_number INTEGER NOT NULL,
      date_administered TEXT NOT NULL,
      next_due_date TEXT,
      administered_by INTEGER NOT NULL,
      batch_number TEXT,
      site TEXT,
      reaction_notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients(id),
      FOREIGN KEY (administered_by) REFERENCES users(id)
    )
  `);

  // Referrals table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS referrals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      from_doctor_id INTEGER NOT NULL,
      to_doctor_name TEXT NOT NULL,
      specialty TEXT NOT NULL,
      reason TEXT NOT NULL,
      urgency TEXT NOT NULL,
      referral_date TEXT NOT NULL,
      appointment_date TEXT,
      status TEXT DEFAULT 'Pending',
      notes TEXT,
      outcome TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients(id),
      FOREIGN KEY (from_doctor_id) REFERENCES users(id)
    )
  `);

  // Consent forms table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS consent_forms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      form_type TEXT NOT NULL,
      description TEXT NOT NULL,
      consent_date TEXT NOT NULL,
      patient_signature TEXT,
      witness_id INTEGER,
      witness_signature TEXT,
      expires_at TEXT,
      status TEXT DEFAULT 'Active',
      pdf_path TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients(id),
      FOREIGN KEY (witness_id) REFERENCES users(id)
    )
  `);

  // Incident reports table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS incident_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      incident_type TEXT NOT NULL,
      severity TEXT NOT NULL,
      location TEXT NOT NULL,
      incident_date TEXT NOT NULL,
      incident_time TEXT NOT NULL,
      description TEXT NOT NULL,
      persons_involved TEXT,
      witness_names TEXT,
      immediate_action TEXT,
      corrective_actions TEXT,
      reported_by INTEGER NOT NULL,
      status TEXT DEFAULT 'Under Investigation',
      follow_up TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (reported_by) REFERENCES users(id)
    )
  `);

  // Blood bank inventory table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS blood_inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      blood_type TEXT NOT NULL,
      rh_factor TEXT NOT NULL,
      donation_date TEXT NOT NULL,
      expiry_date TEXT NOT NULL,
      donor_id TEXT,
      volume_ml INTEGER NOT NULL,
      status TEXT DEFAULT 'Available',
      tests_completed INTEGER DEFAULT 0,
      reserved_for INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (reserved_for) REFERENCES patients(id)
    )
  `);

  // Equipment tracking table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS medical_equipment (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      equipment_name TEXT NOT NULL,
      equipment_type TEXT NOT NULL,
      serial_number TEXT UNIQUE NOT NULL,
      manufacturer TEXT,
      model TEXT,
      purchase_date TEXT,
      warranty_expiry TEXT,
      location TEXT NOT NULL,
      department TEXT NOT NULL,
      status TEXT DEFAULT 'Available',
      last_maintenance TEXT,
      next_maintenance TEXT,
      assigned_to INTEGER,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (assigned_to) REFERENCES users(id)
    )
  `);

  // Dietary management table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS meal_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      meal_date TEXT NOT NULL,
      meal_type TEXT NOT NULL,
      diet_type TEXT NOT NULL,
      restrictions TEXT,
      allergies TEXT,
      special_instructions TEXT,
      meal_delivered INTEGER DEFAULT 0,
      delivery_time TEXT,
      status TEXT DEFAULT 'Ordered',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients(id)
    )
  `);

  // Nurse patient assignments table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS nurse_patient_assignments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nurse_id INTEGER NOT NULL,
      patient_id INTEGER NOT NULL,
      shift_id INTEGER,
      assigned_date TEXT NOT NULL,
      assignment_start TEXT NOT NULL,
      assignment_end TEXT,
      status TEXT DEFAULT 'Active',
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (nurse_id) REFERENCES users(id),
      FOREIGN KEY (patient_id) REFERENCES patients(id),
      FOREIGN KEY (shift_id) REFERENCES shifts(id)
    )
  `);

  console.log('✓ Database tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw new Error(`Failed to create tables: ${error.message || error}`);
  }
}

// ========== PATIENT OPERATIONS ==========

export async function getAllPatients() {
  const db = await initDatabase();
  return await db.select('SELECT * FROM patients ORDER BY id DESC');
}

export async function getPatientById(id) {
  const db = await initDatabase();
  const results = await db.select('SELECT * FROM patients WHERE id = ?', [id]);
  return results[0];
}

export async function createPatient(patient) {
  const db = await initDatabase();
  const result = await db.execute(
    `INSERT INTO patients (name, age, room, condition, admission_date, blood_type, allergies)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [patient.name, patient.age, patient.room, patient.condition, patient.admissionDate, patient.bloodType, patient.allergies]
  );
  return result.lastInsertId;
}

export async function updatePatient(id, patient) {
  const db = await initDatabase();
  await db.execute(
    `UPDATE patients 
     SET name = ?, age = ?, room = ?, condition = ?, blood_type = ?, allergies = ?
     WHERE id = ?`,
    [patient.name, patient.age, patient.room, patient.condition, patient.bloodType, patient.allergies, id]
  );
}

export async function deletePatient(id) {
  const db = await initDatabase();
  await db.execute('DELETE FROM patients WHERE id = ?', [id]);
}

// ========== APPOINTMENT OPERATIONS ==========

export async function getAllAppointments() {
  const db = await initDatabase();
  return await db.select('SELECT * FROM appointments ORDER BY date, time');
}

export async function getAppointmentsByPatientId(patientId) {
  const db = await initDatabase();
  return await db.select('SELECT * FROM appointments WHERE patient_id = ? ORDER BY date, time', [patientId]);
}

export async function createAppointment(appointment) {
  const db = await initDatabase();
  const result = await db.execute(
    `INSERT INTO appointments (patient_id, patient_name, date, time, type, status, doctor)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [appointment.patientId, appointment.patientName, appointment.date, appointment.time, appointment.type, appointment.status, appointment.doctor]
  );
  return result.lastInsertId;
}

export async function updateAppointment(id, appointment) {
  const db = await initDatabase();
  await db.execute(
    `UPDATE appointments 
     SET patient_name = ?, date = ?, time = ?, type = ?, status = ?, doctor = ?
     WHERE id = ?`,
    [appointment.patientName, appointment.date, appointment.time, appointment.type, appointment.status, appointment.doctor, id]
  );
}

export async function deleteAppointment(id) {
  const db = await initDatabase();
  await db.execute('DELETE FROM appointments WHERE id = ?', [id]);
}

// ========== TREATMENT OPERATIONS ==========

export async function getAllTreatments() {
  const db = await initDatabase();
  return await db.select('SELECT * FROM treatments ORDER BY id DESC');
}

export async function getTreatmentsByPatientId(patientId) {
  const db = await initDatabase();
  return await db.select('SELECT * FROM treatments WHERE patient_id = ? ORDER BY id DESC', [patientId]);
}

export async function createTreatment(treatment) {
  const db = await initDatabase();
  const result = await db.execute(
    `INSERT INTO treatments (patient_id, medication, dose, frequency, start_date, end_date, applied_by, last_application, 
     responsible_doctor, administration_times, status, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      treatment.patientId, 
      treatment.medication, 
      treatment.dose, 
      treatment.frequency, 
      treatment.startDate, 
      treatment.endDate || null,
      treatment.appliedBy, 
      treatment.lastApplication, 
      treatment.responsibleDoctor || null,
      treatment.administrationTimes || null,
      treatment.status || 'Activo',
      treatment.notes || null
    ]
  );
  return result.lastInsertId;
}

// ========== VITAL SIGNS OPERATIONS ==========

export async function getAllVitalSigns() {
  const db = await initDatabase();
  return await db.select('SELECT * FROM vital_signs ORDER BY date DESC');
}

export async function getVitalSignsByPatientId(patientId) {
  const db = await initDatabase();
  return await db.select('SELECT * FROM vital_signs WHERE patient_id = ? ORDER BY date DESC', [patientId]);
}

export async function createVitalSigns(vitalSigns) {
  const db = await initDatabase();
  const result = await db.execute(
    `INSERT INTO vital_signs (patient_id, date, temperature, blood_pressure, heart_rate, respiratory_rate, registered_by)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [vitalSigns.patientId, vitalSigns.date, vitalSigns.temperature, vitalSigns.bloodPressure, vitalSigns.heartRate, vitalSigns.respiratoryRate, vitalSigns.registeredBy]
  );
  return result.lastInsertId;
}

// ========== LAB TEST OPERATIONS ==========

export async function getAllLabTests() {
  const db = await initDatabase();
  return await db.select('SELECT * FROM lab_tests ORDER BY date DESC');
}

export async function getLabTestsByPatientId(patientId) {
  const db = await initDatabase();
  return await db.select('SELECT * FROM lab_tests WHERE patient_id = ? ORDER BY date DESC', [patientId]);
}

export async function createLabTest(labTest) {
  const db = await initDatabase();
  const result = await db.execute(
    `INSERT INTO lab_tests (patient_id, test, date, status, results, ordered_by)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [labTest.patientId, labTest.test, labTest.date, labTest.status, labTest.results, labTest.orderedBy]
  );
  return result.lastInsertId;
}

// ========== MEDICAL HISTORY OPERATIONS ==========

export async function getAllMedicalHistory() {
  const db = await initDatabase();
  return await db.select('SELECT * FROM medical_history ORDER BY date DESC');
}

export async function getMedicalHistoryByPatientId(patientId) {
  const db = await initDatabase();
  return await db.select('SELECT * FROM medical_history WHERE patient_id = ? ORDER BY date DESC', [patientId]);
}

export async function createMedicalHistory(record) {
  const db = await initDatabase();
  const result = await db.execute(
    `INSERT INTO medical_history (patient_id, date, diagnosis, treatment, notes, doctor)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [record.patientId, record.date, record.diagnosis, record.treatment, record.notes, record.doctor]
  );
  return result.lastInsertId;
}

// ========== NURSE NOTES OPERATIONS ==========

export async function getAllNurseNotes() {
  const db = await initDatabase();
  return await db.select('SELECT * FROM nurse_notes ORDER BY date DESC');
}

export async function getNurseNotesByPatientId(patientId) {
  const db = await initDatabase();
  return await db.select('SELECT * FROM nurse_notes WHERE patient_id = ? ORDER BY date DESC', [patientId]);
}

export async function createNurseNote(note) {
  const db = await initDatabase();
  const result = await db.execute(
    `INSERT INTO nurse_notes (patient_id, date, note, note_type, nurse_name)
     VALUES (?, ?, ?, ?, ?)`,
    [note.patientId, note.date, note.note, note.noteType || 'evolutiva', note.nurseName]
  );
  return result.lastInsertId;
}

// ========== NURSING SHIFT REPORT OPERATIONS ==========

export async function createNursingShiftReport(report) {
  const db = await initDatabase();
  const result = await db.execute(
    `INSERT INTO nursing_shift_reports 
     (shift_date, shift_type, nurse_id, nurse_name, start_time, end_time, 
      patients_assigned, general_observations, incidents, pending_tasks, 
      handover_notes, supervisor_name, status) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      report.shiftDate,
      report.shiftType,
      report.nurseId,
      report.nurseName,
      report.startTime,
      report.endTime || null,
      report.patientsAssigned,
      report.generalObservations || null,
      report.incidents || null,
      report.pendingTasks || null,
      report.handoverNotes || null,
      report.supervisorName || null,
      report.status || 'En Curso'
    ]
  );
  return result.lastInsertId;
}

export async function updateNursingShiftReport(reportId, updates) {
  const db = await initDatabase();
  const fields = [];
  const values = [];
  
  if (updates.endTime !== undefined) {
    fields.push('end_time = ?');
    values.push(updates.endTime);
  }
  if (updates.generalObservations !== undefined) {
    fields.push('general_observations = ?');
    values.push(updates.generalObservations);
  }
  if (updates.incidents !== undefined) {
    fields.push('incidents = ?');
    values.push(updates.incidents);
  }
  if (updates.pendingTasks !== undefined) {
    fields.push('pending_tasks = ?');
    values.push(updates.pendingTasks);
  }
  if (updates.handoverNotes !== undefined) {
    fields.push('handover_notes = ?');
    values.push(updates.handoverNotes);
  }
  if (updates.supervisorName !== undefined) {
    fields.push('supervisor_name = ?');
    values.push(updates.supervisorName);
  }
  if (updates.status !== undefined) {
    fields.push('status = ?');
    values.push(updates.status);
  }
  
  fields.push('updated_at = CURRENT_TIMESTAMP');
  values.push(reportId);
  
  await db.execute(
    `UPDATE nursing_shift_reports SET ${fields.join(', ')} WHERE id = ?`,
    values
  );
}

export async function getNursingShiftReportsByNurseId(nurseId) {
  const db = await initDatabase();
  return await db.select(
    'SELECT * FROM nursing_shift_reports WHERE nurse_id = ? ORDER BY shift_date DESC, created_at DESC',
    [nurseId]
  );
}

export async function getNursingShiftReportByDateAndNurse(shiftDate, nurseId) {
  const db = await initDatabase();
  const reports = await db.select(
    'SELECT * FROM nursing_shift_reports WHERE shift_date = ? AND nurse_id = ? ORDER BY created_at DESC LIMIT 1',
    [shiftDate, nurseId]
  );
  return reports.length > 0 ? reports[0] : null;
}

export async function getAllNursingShiftReports() {
  const db = await initDatabase();
  return await db.select(
    'SELECT * FROM nursing_shift_reports ORDER BY shift_date DESC, created_at DESC'
  );
}

// ========== DATA SEEDING (for initial demo data) ==========

export async function seedInitialData() {
  const db = await initDatabase();
  
  // Check if data already exists
  const existingPatients = await db.select('SELECT COUNT(*) as count FROM patients');
  if (existingPatients[0].count > 0) {
    console.log('✓ Database already has data, skipping seed');
    return;
  }

  console.log('Seeding initial data...');

  // Seed patients
  await createPatient({
    name: 'Juan Pérez',
    age: 45,
    room: '201',
    condition: 'Estable',
    admissionDate: '2025-10-25',
    bloodType: 'O+',
    allergies: 'Penicilina'
  });

  await createPatient({
    name: 'María González',
    age: 62,
    room: '305',
    condition: 'Crítico',
    admissionDate: '2025-10-27',
    bloodType: 'A+',
    allergies: 'Ninguna'
  });

  await createPatient({
    name: 'Carlos Rodríguez',
    age: 38,
    room: '102',
    condition: 'Recuperación',
    admissionDate: '2025-10-23',
    bloodType: 'B+',
    allergies: 'Aspirina'
  });

  console.log('✓ Initial data seeded successfully');
}

// ========== NOTIFICATION OPERATIONS ==========

export async function getAllNotifications(userId = null) {
  const db = await initDatabase();
  if (userId) {
    return await db.select('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC', [userId]);
  }
  return await db.select('SELECT * FROM notifications ORDER BY created_at DESC');
}

export async function getUnreadNotifications(userId) {
  const db = await initDatabase();
  return await db.select('SELECT * FROM notifications WHERE user_id = ? AND is_read = 0 ORDER BY created_at DESC', [userId]);
}

export async function createNotification(notification) {
  const db = await initDatabase();
  const result = await db.execute(
    `INSERT INTO notifications (user_id, title, message, type, priority, link)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [notification.userId, notification.title, notification.message, notification.type, notification.priority || 'normal', notification.link || null]
  );
  return result.lastInsertId;
}

export async function markNotificationAsRead(id) {
  const db = await initDatabase();
  await db.execute('UPDATE notifications SET is_read = 1 WHERE id = ?', [id]);
}

export async function markAllNotificationsAsRead(userId) {
  const db = await initDatabase();
  await db.execute('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [userId]);
}

export async function deleteNotification(id) {
  const db = await initDatabase();
  await db.execute('DELETE FROM notifications WHERE id = ?', [id]);
}

// ========== ROOM OPERATIONS ==========

export async function getAllRooms() {
  const db = await initDatabase();
  return await db.select('SELECT * FROM rooms ORDER BY floor, room_number');
}

export async function getAvailableRooms() {
  const db = await initDatabase();
  return await db.select('SELECT * FROM rooms WHERE occupied_beds < bed_count ORDER BY floor, room_number');
}

export async function getRoomById(id) {
  const db = await initDatabase();
  const results = await db.select('SELECT * FROM rooms WHERE id = ?', [id]);
  return results[0];
}

export async function createRoom(room) {
  const db = await initDatabase();
  const result = await db.execute(
    `INSERT INTO rooms (room_number, floor, department, room_type, bed_count, equipment, daily_rate)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [room.roomNumber, room.floor, room.department, room.roomType, room.bedCount, room.equipment, room.dailyRate]
  );
  return result.lastInsertId;
}

export async function updateRoom(id, room) {
  const db = await initDatabase();
  await db.execute(
    `UPDATE rooms 
     SET room_number = ?, floor = ?, department = ?, room_type = ?, bed_count = ?, occupied_beds = ?, status = ?, equipment = ?, daily_rate = ?
     WHERE id = ?`,
    [room.roomNumber, room.floor, room.department, room.roomType, room.bedCount, room.occupiedBeds, room.status, room.equipment, room.dailyRate, id]
  );
}

export async function deleteRoom(id) {
  const db = await initDatabase();
  await db.execute('DELETE FROM rooms WHERE id = ?', [id]);
}

// ========== PRESCRIPTION OPERATIONS ==========

export async function getAllPrescriptions() {
  const db = await initDatabase();
  return await db.select('SELECT * FROM prescriptions ORDER BY prescribed_date DESC');
}

export async function getPrescriptionsByPatientId(patientId) {
  const db = await initDatabase();
  return await db.select('SELECT * FROM prescriptions WHERE patient_id = ? ORDER BY prescribed_date DESC', [patientId]);
}

export async function getActivePrescriptions(patientId) {
  const db = await initDatabase();
  return await db.select('SELECT * FROM prescriptions WHERE patient_id = ? AND status = "Active" ORDER BY prescribed_date DESC', [patientId]);
}

export async function createPrescription(prescription) {
  const db = await initDatabase();
  const result = await db.execute(
    `INSERT INTO prescriptions (patient_id, doctor_id, medication_name, dosage, frequency, duration, instructions, prescribed_date, start_date, end_date, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [prescription.patientId, prescription.doctorId, prescription.medicationName, prescription.dosage, prescription.frequency, prescription.duration, prescription.instructions, prescription.prescribedDate, prescription.startDate, prescription.endDate, prescription.status || 'Active']
  );
  return result.lastInsertId;
}

export async function updatePrescription(id, prescription) {
  const db = await initDatabase();
  await db.execute(
    `UPDATE prescriptions 
     SET medication_name = ?, dosage = ?, frequency = ?, duration = ?, instructions = ?, end_date = ?, status = ?
     WHERE id = ?`,
    [prescription.medicationName, prescription.dosage, prescription.frequency, prescription.duration, prescription.instructions, prescription.endDate, prescription.status, id]
  );
}

// ========== INVOICE OPERATIONS ==========

export async function getAllInvoices() {
  const db = await initDatabase();
  return await db.select('SELECT * FROM invoices ORDER BY invoice_date DESC');
}

export async function getInvoicesByPatientId(patientId) {
  const db = await initDatabase();
  return await db.select('SELECT * FROM invoices WHERE patient_id = ? ORDER BY invoice_date DESC', [patientId]);
}

export async function getInvoiceById(id) {
  const db = await initDatabase();
  const results = await db.select('SELECT * FROM invoices WHERE id = ?', [id]);
  return results[0];
}

export async function createInvoice(invoice) {
  const db = await initDatabase();
  const result = await db.execute(
    `INSERT INTO invoices (patient_id, invoice_number, invoice_date, due_date, subtotal, tax, discount, total, status, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [invoice.patientId, invoice.invoiceNumber, invoice.invoiceDate, invoice.dueDate, invoice.subtotal, invoice.tax || 0, invoice.discount || 0, invoice.total, invoice.status || 'Pending', invoice.notes]
  );
  return result.lastInsertId;
}

export async function updateInvoice(id, invoice) {
  const db = await initDatabase();
  await db.execute(
    `UPDATE invoices 
     SET due_date = ?, amount_paid = ?, status = ?, payment_method = ?, notes = ?
     WHERE id = ?`,
    [invoice.dueDate, invoice.amountPaid, invoice.status, invoice.paymentMethod, invoice.notes, id]
  );
}

export async function getInvoiceItems(invoiceId) {
  const db = await initDatabase();
  return await db.select('SELECT * FROM invoice_items WHERE invoice_id = ?', [invoiceId]);
}

export async function addInvoiceItem(item) {
  const db = await initDatabase();
  const result = await db.execute(
    `INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, total, item_type)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [item.invoiceId, item.description, item.quantity, item.unitPrice, item.total, item.itemType]
  );
  return result.lastInsertId;
}

// ========== PHARMACY OPERATIONS ==========

export async function getAllPharmacyItems() {
  const db = await initDatabase();
  return await db.select('SELECT * FROM pharmacy_inventory ORDER BY medication_name');
}

export async function getLowStockItems() {
  const db = await initDatabase();
  return await db.select('SELECT * FROM pharmacy_inventory WHERE quantity <= reorder_level AND status = "Available"');
}

export async function getExpiringMedications(days = 30) {
  const db = await initDatabase();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  return await db.select('SELECT * FROM pharmacy_inventory WHERE expiry_date <= ? AND status = "Available"', [futureDate.toISOString().split('T')[0]]);
}

export async function createPharmacyItem(item) {
  const db = await initDatabase();
  const result = await db.execute(
    `INSERT INTO pharmacy_inventory (medication_name, generic_name, category, quantity, unit, reorder_level, unit_price, supplier, batch_number, manufacture_date, expiry_date, storage_location)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [item.medicationName, item.genericName, item.category, item.quantity, item.unit, item.reorderLevel, item.unitPrice, item.supplier, item.batchNumber, item.manufactureDate, item.expiryDate, item.storageLocation]
  );
  return result.lastInsertId;
}

export async function updatePharmacyItem(id, item) {
  const db = await initDatabase();
  await db.execute(
    `UPDATE pharmacy_inventory 
     SET quantity = ?, unit_price = ?, supplier = ?, status = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [item.quantity, item.unitPrice, item.supplier, item.status, id]
  );
}

// ========== EMERGENCY OPERATIONS ==========

export async function getAllEmergencyCases() {
  const db = await initDatabase();
  return await db.select('SELECT * FROM emergency_cases ORDER BY arrival_time DESC');
}

export async function getActiveEmergencyCases() {
  const db = await initDatabase();
  return await db.select('SELECT * FROM emergency_cases WHERE status != "Discharged" AND status != "Admitted" ORDER BY triage_level, arrival_time');
}

export async function createEmergencyCase(emergencyCase) {
  const db = await initDatabase();
  const result = await db.execute(
    `INSERT INTO emergency_cases (patient_name, age, gender, arrival_time, triage_level, chief_complaint, vital_signs, assigned_to, emergency_contact, ambulance_arrival)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [emergencyCase.patientName, emergencyCase.age, emergencyCase.gender, emergencyCase.arrivalTime, emergencyCase.triageLevel, emergencyCase.chiefComplaint, emergencyCase.vitalSigns, emergencyCase.assignedTo, emergencyCase.emergencyContact, emergencyCase.ambulanceArrival ? 1 : 0]
  );
  return result.lastInsertId;
}

export async function updateEmergencyCase(id, emergencyCase) {
  const db = await initDatabase();
  await db.execute(
    `UPDATE emergency_cases 
     SET status = ?, assigned_to = ?, vital_signs = ?, outcome = ?, discharge_time = ?
     WHERE id = ?`,
    [emergencyCase.status, emergencyCase.assignedTo, emergencyCase.vitalSigns, emergencyCase.outcome, emergencyCase.dischargeTime, id]
  );
}

// ========== SURGERY OPERATIONS ==========

export async function getAllSurgeries() {
  const db = await initDatabase();
  return await db.select('SELECT * FROM surgeries ORDER BY scheduled_date DESC, scheduled_time');
}

export async function getUpcomingSurgeries() {
  const db = await initDatabase();
  const today = new Date().toISOString().split('T')[0];
  return await db.select('SELECT * FROM surgeries WHERE scheduled_date >= ? AND status = "Scheduled" ORDER BY scheduled_date, scheduled_time', [today]);
}

export async function createSurgery(surgery) {
  const db = await initDatabase();
  const result = await db.execute(
    `INSERT INTO surgeries (patient_id, procedure_name, scheduled_date, scheduled_time, duration, operating_room, surgeon_id, anesthesiologist_id, nurses, pre_op_notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [surgery.patientId, surgery.procedureName, surgery.scheduledDate, surgery.scheduledTime, surgery.duration, surgery.operatingRoom, surgery.surgeonId, surgery.anesthesiologistId, surgery.nurses, surgery.preOpNotes]
  );
  return result.lastInsertId;
}

export async function updateSurgery(id, surgery) {
  const db = await initDatabase();
  await db.execute(
    `UPDATE surgeries 
     SET status = ?, post_op_notes = ?, complications = ?, completed_at = ?
     WHERE id = ?`,
    [surgery.status, surgery.postOpNotes, surgery.complications, surgery.completedAt, id]
  );
}

// ========== IMAGING OPERATIONS ==========

export async function getAllImagingTests() {
  const db = await initDatabase();
  return await db.select('SELECT * FROM imaging_tests ORDER BY ordered_date DESC');
}

export async function getPendingImagingTests() {
  const db = await initDatabase();
  return await db.select('SELECT * FROM imaging_tests WHERE status != "Completed" ORDER BY priority DESC, ordered_date');
}

export async function createImagingTest(test) {
  const db = await initDatabase();
  const result = await db.execute(
    `INSERT INTO imaging_tests (patient_id, test_type, body_part, ordered_by, ordered_date, scheduled_date, priority)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [test.patientId, test.testType, test.bodyPart, test.orderedBy, test.orderedDate, test.scheduledDate, test.priority || 'Routine']
  );
  return result.lastInsertId;
}

export async function updateImagingTest(id, test) {
  const db = await initDatabase();
  await db.execute(
    `UPDATE imaging_tests 
     SET performed_date = ?, radiologist_id = ?, status = ?, findings = ?, impression = ?, images_path = ?, report_url = ?
     WHERE id = ?`,
    [test.performedDate, test.radiologistId, test.status, test.findings, test.impression, test.imagesPath, test.reportUrl, id]
  );
}

// ========== SHIFT OPERATIONS ==========

export async function getAllShifts() {
  const db = await initDatabase();
  return await db.select('SELECT * FROM shifts ORDER BY date DESC, start_time');
}

export async function getShiftsByUserId(userId) {
  const db = await initDatabase();
  return await db.select('SELECT * FROM shifts WHERE user_id = ? ORDER BY date DESC', [userId]);
}

export async function getTodayShifts() {
  const db = await initDatabase();
  const today = new Date().toISOString().split('T')[0];
  return await db.select('SELECT * FROM shifts WHERE date = ? ORDER BY start_time', [today]);
}

export async function createShift(shift) {
  const db = await initDatabase();
  const result = await db.execute(
    `INSERT INTO shifts (user_id, date, start_time, end_time, shift_type, department, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [shift.userId, shift.date, shift.startTime, shift.endTime, shift.shiftType, shift.department, shift.notes]
  );
  return result.lastInsertId;
}

export async function updateShift(id, shift) {
  const db = await initDatabase();
  await db.execute(
    `UPDATE shifts 
     SET date = ?, start_time = ?, end_time = ?, shift_type = ?, department = ?, status = ?, notes = ?
     WHERE id = ?`,
    [shift.date, shift.startTime, shift.endTime, shift.shiftType, shift.department, shift.status, shift.notes, id]
  );
}

export async function deleteShift(id) {
  const db = await initDatabase();
  await db.execute('DELETE FROM shifts WHERE id = ?', [id]);
}

// ========== NURSE PATIENT ASSIGNMENT OPERATIONS ==========

export async function getAssignedPatients(nurseId, date = null) {
  const db = await initDatabase();
  const today = date || new Date().toISOString().split('T')[0];
  
  // Get patients assigned to this nurse for today or active assignments
  const query = `
    SELECT 
      p.*,
      npa.id as assignment_id,
      npa.assigned_date,
      npa.assignment_start,
      npa.assignment_end,
      npa.notes as assignment_notes,
      npa.status as assignment_status
    FROM nurse_patient_assignments npa
    JOIN patients p ON npa.patient_id = p.id
    WHERE npa.nurse_id = ? 
    AND npa.status = 'Active'
    AND (npa.assigned_date = ? OR npa.assignment_end IS NULL OR npa.assignment_end >= ?)
    ORDER BY p.condition DESC, p.room
  `;
  
  return await db.select(query, [nurseId, today, today]);
}

export async function assignPatientToNurse(assignment) {
  const db = await initDatabase();
  const result = await db.execute(
    `INSERT INTO nurse_patient_assignments (nurse_id, patient_id, shift_id, assigned_date, assignment_start, assignment_end, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [assignment.nurseId, assignment.patientId, assignment.shiftId, assignment.assignedDate, assignment.assignmentStart, assignment.assignmentEnd, assignment.notes]
  );
  return result.lastInsertId;
}

export async function updatePatientAssignment(id, assignment) {
  const db = await initDatabase();
  await db.execute(
    `UPDATE nurse_patient_assignments 
     SET assignment_end = ?, status = ?, notes = ?
     WHERE id = ?`,
    [assignment.assignmentEnd, assignment.status, assignment.notes, id]
  );
}

export async function getNurseShiftsWithDetails(nurseId, startDate = null, endDate = null) {
  const db = await initDatabase();
  const today = new Date().toISOString().split('T')[0];
  const start = startDate || today;
  const end = endDate || today;
  
  const query = `
    SELECT 
      s.*,
      u.name as nurse_name,
      COUNT(npa.id) as assigned_patients_count
    FROM shifts s
    JOIN users u ON s.user_id = u.id
    LEFT JOIN nurse_patient_assignments npa ON s.id = npa.shift_id AND npa.status = 'Active'
    WHERE s.user_id = ? 
    AND s.date BETWEEN ? AND ?
    GROUP BY s.id
    ORDER BY s.date DESC, s.start_time
  `;
  
  return await db.select(query, [nurseId, start, end]);
}

export async function getActiveNurseShift(nurseId) {
  const db = await initDatabase();
  const today = new Date().toISOString().split('T')[0];
  const now = new Date().toTimeString().split(' ')[0].substring(0, 5); // HH:MM format
  
  const query = `
    SELECT * FROM shifts 
    WHERE user_id = ? 
    AND date = ?
    AND start_time <= ?
    AND end_time >= ?
    AND status = 'Scheduled'
    LIMIT 1
  `;
  
  const results = await db.select(query, [nurseId, today, now, now]);
  return results[0] || null;
}

// ========== AUDIT LOG OPERATIONS ==========

export async function createAuditLog(log) {
  const db = await initDatabase();
  const result = await db.execute(
    `INSERT INTO audit_logs (user_id, action, table_name, record_id, old_value, new_value, ip_address)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [log.userId, log.action, log.tableName, log.recordId, log.oldValue, log.newValue, log.ipAddress]
  );
  return result.lastInsertId;
}

export async function getAuditLogs(limit = 100) {
  const db = await initDatabase();
  return await db.select('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT ?', [limit]);
}

export async function getAuditLogsByUser(userId) {
  const db = await initDatabase();
  return await db.select('SELECT * FROM audit_logs WHERE user_id = ? ORDER BY timestamp DESC', [userId]);
}

// ========== OTHER MODULE OPERATIONS ==========

export async function getAllVaccinations(patientId = null) {
  const db = await initDatabase();
  if (patientId) {
    return await db.select('SELECT * FROM vaccinations WHERE patient_id = ? ORDER BY date_administered DESC', [patientId]);
  }
  return await db.select('SELECT * FROM vaccinations ORDER BY date_administered DESC');
}

export async function createVaccination(vaccination) {
  const db = await initDatabase();
  const result = await db.execute(
    `INSERT INTO vaccinations (patient_id, vaccine_name, dose_number, date_administered, next_due_date, administered_by, batch_number, site, reaction_notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [vaccination.patientId, vaccination.vaccineName, vaccination.doseNumber, vaccination.dateAdministered, vaccination.nextDueDate, vaccination.administeredBy, vaccination.batchNumber, vaccination.site, vaccination.reactionNotes]
  );
  return result.lastInsertId;
}

export async function getAllReferrals(patientId = null) {
  const db = await initDatabase();
  if (patientId) {
    return await db.select('SELECT * FROM referrals WHERE patient_id = ? ORDER BY referral_date DESC', [patientId]);
  }
  return await db.select('SELECT * FROM referrals ORDER BY referral_date DESC');
}

export async function createReferral(referral) {
  const db = await initDatabase();
  const result = await db.execute(
    `INSERT INTO referrals (patient_id, from_doctor_id, to_doctor_name, specialty, reason, urgency, referral_date, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [referral.patientId, referral.fromDoctorId, referral.toDoctorName, referral.specialty, referral.reason, referral.urgency, referral.referralDate, referral.notes]
  );
  return result.lastInsertId;
}

export async function updateReferral(id, referral) {
  const db = await initDatabase();
  await db.execute(
    `UPDATE referrals 
     SET appointment_date = ?, status = ?, outcome = ?
     WHERE id = ?`,
    [referral.appointmentDate, referral.status, referral.outcome, id]
  );
}

export async function getAllIncidentReports() {
  const db = await initDatabase();
  return await db.select('SELECT * FROM incident_reports ORDER BY incident_date DESC, incident_time DESC');
}

export async function createIncidentReport(report) {
  const db = await initDatabase();
  const result = await db.execute(
    `INSERT INTO incident_reports (incident_type, severity, location, incident_date, incident_time, description, persons_involved, witness_names, immediate_action, reported_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [report.incidentType, report.severity, report.location, report.incidentDate, report.incidentTime, report.description, report.personsInvolved, report.witnessNames, report.immediateAction, report.reportedBy]
  );
  return result.lastInsertId;
}

export async function updateIncidentReport(id, report) {
  const db = await initDatabase();
  await db.execute(
    `UPDATE incident_reports 
     SET corrective_actions = ?, status = ?, follow_up = ?
     WHERE id = ?`,
    [report.correctiveActions, report.status, report.followUp, id]
  );
}

export async function getBloodInventory() {
  const db = await initDatabase();
  return await db.select('SELECT * FROM blood_inventory WHERE status = "Available" ORDER BY blood_type, expiry_date');
}

export async function createBloodUnit(bloodUnit) {
  const db = await initDatabase();
  const result = await db.execute(
    `INSERT INTO blood_inventory (blood_type, rh_factor, donation_date, expiry_date, donor_id, volume_ml, tests_completed)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [bloodUnit.bloodType, bloodUnit.rhFactor, bloodUnit.donationDate, bloodUnit.expiryDate, bloodUnit.donorId, bloodUnit.volumeMl, bloodUnit.testsCompleted ? 1 : 0]
  );
  return result.lastInsertId;
}

export async function getAllEquipment() {
  const db = await initDatabase();
  return await db.select('SELECT * FROM medical_equipment ORDER BY department, equipment_name');
}

export async function createEquipment(equipment) {
  const db = await initDatabase();
  const result = await db.execute(
    `INSERT INTO medical_equipment (equipment_name, equipment_type, serial_number, manufacturer, model, purchase_date, warranty_expiry, location, department, last_maintenance, next_maintenance)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [equipment.equipmentName, equipment.equipmentType, equipment.serialNumber, equipment.manufacturer, equipment.model, equipment.purchaseDate, equipment.warrantyExpiry, equipment.location, equipment.department, equipment.lastMaintenance, equipment.nextMaintenance]
  );
  return result.lastInsertId;
}

export async function updateEquipment(id, equipment) {
  const db = await initDatabase();
  await db.execute(
    `UPDATE medical_equipment 
     SET location = ?, status = ?, last_maintenance = ?, next_maintenance = ?, assigned_to = ?, notes = ?
     WHERE id = ?`,
    [equipment.location, equipment.status, equipment.lastMaintenance, equipment.nextMaintenance, equipment.assignedTo, equipment.notes, id]
  );
}

export async function getAllMealOrders(patientId = null) {
  const db = await initDatabase();
  if (patientId) {
    return await db.select('SELECT * FROM meal_orders WHERE patient_id = ? ORDER BY meal_date DESC, meal_type', [patientId]);
  }
  return await db.select('SELECT * FROM meal_orders ORDER BY meal_date DESC');
}

export async function getTodayMealOrders() {
  const db = await initDatabase();
  const today = new Date().toISOString().split('T')[0];
  return await db.select('SELECT * FROM meal_orders WHERE meal_date = ? ORDER BY meal_type', [today]);
}

export async function createMealOrder(order) {
  const db = await initDatabase();
  const result = await db.execute(
    `INSERT INTO meal_orders (patient_id, meal_date, meal_type, diet_type, restrictions, allergies, special_instructions)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [order.patientId, order.mealDate, order.mealType, order.dietType, order.restrictions, order.allergies, order.specialInstructions]
  );
  return result.lastInsertId;
}

export async function updateMealOrder(id, order) {
  const db = await initDatabase();
  await db.execute(
    `UPDATE meal_orders 
     SET meal_delivered = ?, delivery_time = ?, status = ?
     WHERE id = ?`,
    [order.mealDelivered ? 1 : 0, order.deliveryTime, order.status, id]
  );
}

// ==================== USER AUTHENTICATION ====================

// Get user by username
export async function getUserByUsername(username) {
  try {
    const result = await db.select(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
}

// Get user by email
export async function getUserByEmail(email) {
  try {
    const result = await db.select(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('Error getting user by email:', error);
    throw error;
  }
}

// Get nurse by license number (cédula profesional)
export async function getUserByLicenseNumber(licenseNumber) {
  try {
    const result = await db.select(
      "SELECT * FROM users WHERE license_number = ? AND role = 'nurse'",
      [licenseNumber]
    );
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('Error getting user by license number:', error);
    throw error;
  }
}

// Get user by ID
export async function getUserById(id) {
  try {
    const result = await db.select(
      'SELECT id, username, role, name, email, phone, department, specialization, license_number, is_active, last_login, created_at FROM users WHERE id = ?',
      [id]
    );
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('Error getting user by ID:', error);
    throw error;
  }
}

// Initialize sample nurse shifts and patient assignments
export async function initializeSampleNurseData() {
  try {
    const db = await initDatabase();
    
    // Check if sample data already exists
    const existingShifts = await db.select('SELECT COUNT(*) as count FROM shifts');
    if (existingShifts[0].count > 0) {
      console.log('Sample shifts already exist');
      return;
    }
    
    // Get nurse user (assuming enfermero user exists with ID from login)
    const nurses = await db.select('SELECT id FROM users WHERE role = "nurse" OR username = "enfermero"');
    if (nurses.length === 0) {
      console.log('No nurse users found');
      return;
    }
    
    const nurseId = nurses[0].id;
    const today = new Date();
    
    // Create shifts for this week
    const shifts = [
      // Yesterday
      {
        userId: nurseId,
        date: new Date(today.getTime() - 86400000).toISOString().split('T')[0],
        startTime: '07:00',
        endTime: '15:00',
        shiftType: 'Mañana',
        department: 'Medicina General',
        status: 'Completed',
        notes: 'Turno completado sin incidentes'
      },
      // Today
      {
        userId: nurseId,
        date: today.toISOString().split('T')[0],
        startTime: '07:00',
        endTime: '15:00',
        shiftType: 'Mañana',
        department: 'Medicina General',
        status: 'Scheduled',
        notes: 'Turno actual'
      },
      // Tomorrow
      {
        userId: nurseId,
        date: new Date(today.getTime() + 86400000).toISOString().split('T')[0],
        startTime: '15:00',
        endTime: '23:00',
        shiftType: 'Tarde',
        department: 'Medicina General',
        status: 'Scheduled',
        notes: null
      },
      // Day after tomorrow
      {
        userId: nurseId,
        date: new Date(today.getTime() + 172800000).toISOString().split('T')[0],
        startTime: '23:00',
        endTime: '07:00',
        shiftType: 'Noche',
        department: 'Medicina General',
        status: 'Scheduled',
        notes: 'Turno nocturno'
      }
    ];
    
    // Insert shifts
    const shiftIds = [];
    for (const shift of shifts) {
      const result = await db.execute(
        `INSERT INTO shifts (user_id, date, start_time, end_time, shift_type, department, status, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [shift.userId, shift.date, shift.startTime, shift.endTime, shift.shiftType, shift.department, shift.status, shift.notes]
      );
      shiftIds.push(result.lastInsertId);
    }
    
    console.log(`✓ Created ${shifts.length} sample shifts`);
    
    // Get patients for assignments
    const patients = await db.select('SELECT id FROM patients LIMIT 4');
    if (patients.length === 0) {
      console.log('No patients found for assignments');
      return;
    }
    
    // Update patients with triage levels (simulate different urgency levels)
    const triageLevels = [1, 2, 3, 4]; // Mix of urgency levels
    for (let i = 0; i < patients.length && i < triageLevels.length; i++) {
      await db.execute(
        'UPDATE patients SET triage_level = ? WHERE id = ?',
        [triageLevels[i], patients[i].id]
      );
    }
    console.log(`✓ Updated triage levels for ${patients.length} patients`);
    
    // Assign patients to nurse for today's shift (index 1 = today)
    const todayShiftId = shiftIds[1];
    const todayDate = today.toISOString().split('T')[0];
    
    for (const patient of patients) {
      await db.execute(
        `INSERT INTO nurse_patient_assignments (nurse_id, patient_id, shift_id, assigned_date, assignment_start, assignment_end, status, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [nurseId, patient.id, todayShiftId, todayDate, '07:00', '15:00', 'Active', 'Paciente asignado para cuidados generales']
      );
    }
    
    console.log(`✓ Assigned ${patients.length} patients to nurse for today's shift`);
    
    // Add sample treatments with schedules and responsible doctors
    const sampleTreatments = [
      {
        patientId: patients[0].id,
        medication: 'Paracetamol',
        dose: '500mg',
        frequency: 'Cada 8 horas',
        startDate: todayDate,
        appliedBy: 'Enfermero Juan Pérez',
        lastApplication: todayDate + ' 08:00',
        responsibleDoctor: 'Dr. Carlos Ramírez',
        administrationTimes: '08:00,16:00,00:00',
        status: 'Activo',
        notes: 'Para control de fiebre y dolor'
      },
      {
        patientId: patients[0].id,
        medication: 'Omeprazol',
        dose: '20mg',
        frequency: 'Cada 24 horas',
        startDate: todayDate,
        appliedBy: 'Enfermero Juan Pérez',
        lastApplication: todayDate + ' 08:00',
        responsibleDoctor: 'Dr. Carlos Ramírez',
        administrationTimes: '08:00',
        status: 'Activo',
        notes: 'Protector gástrico, tomar en ayunas'
      }
    ];
    
    if (patients.length > 1) {
      sampleTreatments.push({
        patientId: patients[1].id,
        medication: 'Losartán',
        dose: '50mg',
        frequency: 'Cada 12 horas',
        startDate: todayDate,
        appliedBy: 'Enfermero Juan Pérez',
        lastApplication: todayDate + ' 08:00',
        responsibleDoctor: 'Dra. María Torres',
        administrationTimes: '08:00,20:00',
        status: 'Activo',
        notes: 'Para control de presión arterial'
      });
      
      sampleTreatments.push({
        patientId: patients[1].id,
        medication: 'Atorvastatina',
        dose: '10mg',
        frequency: 'Cada 24 horas',
        startDate: todayDate,
        appliedBy: 'Enfermero Juan Pérez',
        lastApplication: todayDate + ' 20:00',
        responsibleDoctor: 'Dra. María Torres',
        administrationTimes: '20:00',
        status: 'Activo',
        notes: 'Para control de colesterol, tomar por la noche'
      });
    }
    
    // Insert treatments
    for (const treatment of sampleTreatments) {
      await db.execute(
        `INSERT INTO treatments (patient_id, medication, dose, frequency, start_date, applied_by, last_application, 
         responsible_doctor, administration_times, status, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          treatment.patientId,
          treatment.medication,
          treatment.dose,
          treatment.frequency,
          treatment.startDate,
          treatment.appliedBy,
          treatment.lastApplication,
          treatment.responsibleDoctor,
          treatment.administrationTimes,
          treatment.status,
          treatment.notes
        ]
      );
    }
    
    console.log(`✓ Created ${sampleTreatments.length} sample treatments with schedules`);
    
  } catch (error) {
    console.error('Error initializing sample nurse data:', error);
  }
}

// Create new user
export async function createUser(userData) {
  try {
    await db.execute(
      'INSERT INTO users (username, password_hash, role, name, email, phone, department, specialization) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [userData.username, userData.password_hash, userData.role, userData.name, userData.email || null, userData.phone || null, userData.department || null, userData.specialization || null]
    );
    console.log('User created successfully');
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

// Get all users (admin only)
export async function getAllUsers() {
  try {
    return await db.select('SELECT id, username, role, name, email, phone, department, specialization, is_active, last_login, created_at FROM users ORDER BY created_at DESC');
  } catch (error) {
    console.error('Error getting users:', error);
    throw error;
  }
}

// Get users by role
export async function getUsersByRole(role) {
  try {
    return await db.select('SELECT id, username, role, name, email, phone, department, specialization FROM users WHERE role = ? AND is_active = 1', [role]);
  } catch (error) {
    console.error('Error getting users by role:', error);
    throw error;
  }
}

// Update user
export async function updateUser(id, userData) {
  try {
    await db.execute(
      'UPDATE users SET name = ?, email = ?, phone = ?, department = ?, specialization = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [userData.name, userData.email || null, userData.phone || null, userData.department || null, userData.specialization || null, id]
    );
    console.log('User updated successfully');
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

// Update user profile
export async function updateUserProfile(id, profileData) {
  try {
    await db.execute(
      'UPDATE users SET name = ?, email = ?, phone = ?, bio = ?, profile_photo = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [profileData.name, profileData.email || null, profileData.phone || null, profileData.bio || null, profileData.profilePhoto || null, id]
    );
    console.log('User profile updated successfully');
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

// Update user password
export async function updateUserPassword(id, newPasswordHash) {
  try {
    await db.execute(
      'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newPasswordHash, id]
    );
    console.log('User password updated successfully');
  } catch (error) {
    console.error('Error updating password:', error);
    throw error;
  }
}

// Update last login
export async function updateLastLogin(id) {
  try {
    const now = new Date().toISOString();
    await db.execute(
      'UPDATE users SET last_login = ? WHERE id = ?',
      [now, id]
    );
  } catch (error) {
    console.error('Error updating last login:', error);
  }
}

// Deactivate user (soft delete)
export async function deactivateUser(id) {
  try {
    await db.execute('UPDATE users SET is_active = 0 WHERE id = ?', [id]);
    console.log('User deactivated successfully');
  } catch (error) {
    console.error('Error deactivating user:', error);
    throw error;
  }
}

// Delete user
export async function deleteUser(id) {
  try {
    await db.execute('DELETE FROM users WHERE id = ?', [id]);
    console.log('User deleted successfully');
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

// ========== PATIENT TRANSFER OPERATIONS ==========

// Get all transfers for a patient
export async function getPatientTransfers(patientId) {
  const db = await initDatabase();
  return await db.select(
    'SELECT * FROM patient_transfers WHERE patient_id = ? ORDER BY transfer_date DESC, transfer_time DESC',
    [patientId]
  );
}

// Get all recent transfers
export async function getAllRecentTransfers(limit = 50) {
  const db = await initDatabase();
  return await db.select(
    `SELECT pt.*, p.name as patient_name 
     FROM patient_transfers pt 
     JOIN patients p ON pt.patient_id = p.id 
     ORDER BY pt.transfer_date DESC, pt.transfer_time DESC 
     LIMIT ?`,
    [limit]
  );
}

// Create patient transfer
export async function createPatientTransfer(transfer) {
  const db = await initDatabase();
  
  // Get current patient location
  const patient = await db.select('SELECT floor, area, room, bed FROM patients WHERE id = ?', [transfer.patientId]);
  
  const fromLocation = patient[0] || {};
  
  // Insert transfer record
  const result = await db.execute(
    `INSERT INTO patient_transfers 
     (patient_id, from_floor, from_area, from_room, from_bed, to_floor, to_area, to_room, to_bed, 
      transfer_date, transfer_time, reason, transferred_by, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      transfer.patientId,
      fromLocation.floor || null,
      fromLocation.area || null,
      fromLocation.room || null,
      fromLocation.bed || null,
      transfer.toFloor,
      transfer.toArea,
      transfer.toRoom,
      transfer.toBed,
      transfer.transferDate,
      transfer.transferTime,
      transfer.reason || null,
      transfer.transferredBy,
      transfer.notes || null
    ]
  );
  
  // Update patient location
  await db.execute(
    `UPDATE patients 
     SET floor = ?, area = ?, room = ?, bed = ?, updated_at = CURRENT_TIMESTAMP 
     WHERE id = ?`,
    [transfer.toFloor, transfer.toArea, transfer.toRoom, transfer.toBed, transfer.patientId]
  );
  
  return result.lastInsertId;
}

// Update patient location (without creating transfer record)
export async function updatePatientLocation(patientId, floor, area, room, bed) {
  const db = await initDatabase();
  await db.execute(
    `UPDATE patients 
     SET floor = ?, area = ?, room = ?, bed = ?, updated_at = CURRENT_TIMESTAMP 
     WHERE id = ?`,
    [floor, area, room, bed, patientId]
  );
}

// Password reset token operations
export async function createPasswordResetToken(userId, token, expiresAt) {
  try {
    await db.execute(
      'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [userId, token, expiresAt]
    );
  } catch (error) {
    console.error('Error creating password reset token:', error);
    throw error;
  }
}

export async function getPasswordResetToken(token) {
  try {
    const result = await db.select(
      'SELECT * FROM password_reset_tokens WHERE token = ? AND used = 0',
      [token]
    );
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('Error getting password reset token:', error);
    throw error;
  }
}

export async function markTokenAsUsed(token) {
  try {
    await db.execute(
      'UPDATE password_reset_tokens SET used = 1 WHERE token = ?',
      [token]
    );
  } catch (error) {
    console.error('Error marking token as used:', error);
    throw error;
  }
}
