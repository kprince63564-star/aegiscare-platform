/**
 * AegisCare - Elderly Care & Smart Medication Management Platform
 * Production Server & RESTful API for Google Cloud Run
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static frontend
app.use(express.static(path.join(__dirname, 'public')));

// In-Memory Database with Pre-seeded Realistic Data
const db = {
  seniors: [
    {
      id: 'sen-001',
      name: 'Eleanor Vance',
      age: 79,
      room: 'Suite 204',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      emergencyContact: { name: 'Sarah Vance (Daughter)', phone: '+1 (555) 234-5678' },
      doctor: 'Dr. Aris Thorne (Cardiology)',
      allergies: ['Penicillin', 'Sulfa'],
      conditions: ['Hypertension', 'Type 2 Diabetes', 'Mild Osteoarthritis'],
      dietary: 'Low sodium, Diabetic-friendly',
      mobility: 'Walker required',
      notes: 'Prefers morning walk in garden at 9:00 AM.',
      createdAt: new Date('2026-01-10').toISOString()
    },
    {
      id: 'sen-002',
      name: 'Arthur Pendelton',
      age: 84,
      room: 'Suite 112',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      emergencyContact: { name: 'Robert Pendelton (Son)', phone: '+1 (555) 876-5432' },
      doctor: 'Dr. Maya Lin (Geriatrics)',
      allergies: ['Aspirin'],
      conditions: ['Early-stage Alzheimer’s', 'High Cholesterol'],
      dietary: 'Soft foods, Pureed dinner',
      mobility: 'Wheelchair assistance',
      notes: 'Needs verbal orientation reminders during medication administration.',
      createdAt: new Date('2026-01-15').toISOString()
    },
    {
      id: 'sen-003',
      name: 'Margaret Chen',
      age: 82,
      room: 'Suite 305',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      emergencyContact: { name: 'David Chen (Son)', phone: '+1 (555) 345-6789' },
      doctor: 'Dr. Samuel Green (Endocrinology)',
      allergies: ['Latex', 'NSAIDs'],
      conditions: ['Chronic Kidney Disease', 'Arrhythmia'],
      dietary: 'Renal diet, fluid restricted 1.5L/day',
      mobility: 'Independent with cane',
      notes: 'Very active in social bridge club.',
      createdAt: new Date('2026-02-01').toISOString()
    }
  ],
  medications: [
    {
      id: 'med-001',
      seniorId: 'sen-001',
      name: 'Lisinopril',
      dosage: '10mg',
      form: 'Tablet',
      frequency: 'Daily (Morning)',
      time: '08:00',
      instructions: 'Take with full glass of water with breakfast',
      purpose: 'Blood Pressure Control',
      stock: 42,
      refillThreshold: 10,
      prescribedBy: 'Dr. Aris Thorne',
      status: 'active',
      logs: [
        { date: '2026-11-15', time: '08:05', status: 'taken', caregiver: 'Nurse Clara' },
        { date: '2026-11-14', time: '08:10', status: 'taken', caregiver: 'Nurse Clara' },
        { date: '2026-11-13', time: '08:00', status: 'taken', caregiver: 'Nurse Kevin' }
      ]
    },
    {
      id: 'med-002',
      seniorId: 'sen-001',
      name: 'Metformin',
      dosage: '500mg',
      form: 'Tablet',
      frequency: 'Twice Daily (Morning & Evening)',
      time: '08:00, 19:00',
      instructions: 'Take immediately after food',
      purpose: 'Blood Glucose Regulation',
      stock: 18,
      refillThreshold: 14,
      prescribedBy: 'Dr. Samuel Green',
      status: 'active',
      logs: [
        { date: '2026-11-15', time: '08:05', status: 'taken', caregiver: 'Nurse Clara' },
        { date: '2026-11-14', time: '19:15', status: 'taken', caregiver: 'Nurse Kevin' }
      ]
    },
    {
      id: 'med-003',
      seniorId: 'sen-002',
      name: 'Donepezil (Aricept)',
      dosage: '10mg',
      form: 'Oral Disintegrating Tablet',
      frequency: 'Nightly (Bedtime)',
      time: '21:00',
      instructions: 'Place on tongue before sleep',
      purpose: 'Cognitive Support / Alzheimer’s',
      stock: 28,
      refillThreshold: 7,
      prescribedBy: 'Dr. Maya Lin',
      status: 'active',
      logs: [
        { date: '2026-11-14', time: '21:05', status: 'taken', caregiver: 'Nurse David' }
      ]
    },
    {
      id: 'med-004',
      seniorId: 'sen-002',
      name: 'Atorvastatin',
      dosage: '20mg',
      form: 'Tablet',
      frequency: 'Nightly (Bedtime)',
      time: '21:00',
      instructions: 'Swallow whole with water',
      purpose: 'Cholesterol Reduction',
      stock: 6, // Low stock alert!
      refillThreshold: 10,
      prescribedBy: 'Dr. Maya Lin',
      status: 'active',
      logs: [
        { date: '2026-11-14', time: '21:05', status: 'taken', caregiver: 'Nurse David' }
      ]
    },
    {
      id: 'med-005',
      seniorId: 'sen-003',
      name: 'Metoprolol Tartrate',
      dosage: '25mg',
      form: 'Tablet',
      frequency: 'Twice Daily (Morning & Evening)',
      time: '09:00, 20:00',
      instructions: 'Check pulse before taking; withhold if pulse < 55',
      purpose: 'Heart Rate & Arrhythmia',
      stock: 35,
      refillThreshold: 10,
      prescribedBy: 'Dr. Aris Thorne',
      status: 'active',
      logs: [
        { date: '2026-11-15', time: '09:02', status: 'taken', caregiver: 'Nurse Clara' }
      ]
    }
  ],
  vitals: [
    {
      id: 'vit-001',
      seniorId: 'sen-001',
      timestamp: '2026-11-15T08:00:00Z',
      systolic: 128,
      diastolic: 82,
      heartRate: 74,
      bloodSugar: 118,
      oxygenSaturation: 98,
      temperature: 98.4,
      painLevel: 2,
      notes: 'Routine morning assessment. Feeling cheerful.'
    },
    {
      id: 'vit-002',
      seniorId: 'sen-001',
      timestamp: '2026-11-14T08:00:00Z',
      systolic: 134,
      diastolic: 86,
      heartRate: 78,
      bloodSugar: 130,
      oxygenSaturation: 97,
      temperature: 98.6,
      painLevel: 3,
      notes: 'Mild right knee stiffness.'
    },
    {
      id: 'vit-003',
      seniorId: 'sen-002',
      timestamp: '2026-11-15T08:30:00Z',
      systolic: 122,
      diastolic: 78,
      heartRate: 68,
      bloodSugar: 98,
      oxygenSaturation: 96,
      temperature: 98.1,
      painLevel: 1,
      notes: 'Rested well through night.'
    },
    {
      id: 'vit-004',
      seniorId: 'sen-003',
      timestamp: '2026-11-15T09:15:00Z',
      systolic: 138,
      diastolic: 88,
      heartRate: 72,
      bloodSugar: 105,
      oxygenSaturation: 98,
      temperature: 98.7,
      painLevel: 2,
      notes: 'Heart rhythm regular, clear lungs.'
    }
  ],
  alerts: [
    {
      id: 'alt-001',
      seniorId: 'sen-002',
      seniorName: 'Arthur Pendelton',
      type: 'REFILL_NEEDED',
      severity: 'warning',
      message: 'Atorvastatin 20mg inventory low (6 tablets remaining). Refill requested.',
      timestamp: new Date('2026-11-15T07:30:00Z').toISOString(),
      resolved: false
    }
  ],
  // Dynamic Custom Collections - Allows storing ANY schema, ANY fields, and ANY number of records
  dynamicCollections: [
    {
      id: 'col-pt-log',
      name: 'Physical Therapy & Mobility Logs',
      description: 'Custom tracking for range of motion, walking distance, and PT goals',
      icon: 'activity',
      schema: [
        { key: 'sessionDate', label: 'Session Date', type: 'date', required: true },
        { key: 'therapistName', label: 'Therapist', type: 'text', required: true },
        { key: 'walkingDistanceMeters', label: 'Distance Walked (meters)', type: 'number', required: true },
        { key: 'balanceScore', label: 'Balance Score (1-10)', type: 'number', required: false },
        { key: 'assistiveDevice', label: 'Device Used', type: 'select', options: ['None', 'Cane', 'Walker', 'Parallel Bars'], required: true },
        { key: 'toleranceStatus', label: 'Session Tolerance', type: 'select', options: ['Excellent', 'Moderate Fatigue', 'Early Termination'], required: true },
        { key: 'clinicalObservations', label: 'Clinical Notes', type: 'text', required: false }
      ],
      records: [
        {
          id: 'rec-pt-1',
          seniorId: 'sen-001',
          sessionDate: '2026-11-14',
          therapistName: 'Marcus Bell, DPT',
          walkingDistanceMeters: 120,
          balanceScore: 8,
          assistiveDevice: 'Walker',
          toleranceStatus: 'Excellent',
          clinicalObservations: 'Cadence improved, posture erect.'
        },
        {
          id: 'rec-pt-2',
          seniorId: 'sen-002',
          sessionDate: '2026-11-13',
          therapistName: 'Marcus Bell, DPT',
          walkingDistanceMeters: 45,
          balanceScore: 5,
          assistiveDevice: 'Parallel Bars',
          toleranceStatus: 'Moderate Fatigue',
          clinicalObservations: 'Completed 3 reps of seated-to-standing transitions.'
        }
      ]
    },
    {
      id: 'col-diet-hydration',
      name: 'Hydration & Nutrition Monitor',
      description: 'Custom micro-nutrient, meal intake percentage, and fluid intake logger',
      icon: 'coffee',
      schema: [
        { key: 'date', label: 'Date', type: 'date', required: true },
        { key: 'mealType', label: 'Meal', type: 'select', options: ['Breakfast', 'Lunch', 'Dinner', 'Snack'], required: true },
        { key: 'mealEatenPercent', label: 'Meal Consumed (%)', type: 'number', required: true },
        { key: 'fluidIntakeMl', label: 'Fluid Intake (mL)', type: 'number', required: true },
        { key: 'swallowingDifficulty', label: 'Dysphagia / Coughing', type: 'boolean', required: false },
        { key: 'dietitianFeedback', label: 'Dietitian Remarks', type: 'text', required: false }
      ],
      records: [
        {
          id: 'rec-dh-1',
          seniorId: 'sen-001',
          date: '2026-11-15',
          mealType: 'Breakfast',
          mealEatenPercent: 90,
          fluidIntakeMl: 350,
          swallowingDifficulty: false,
          dietitianFeedback: 'Ate oatmeal and poached egg cleanly.'
        },
        {
          id: 'rec-dh-2',
          seniorId: 'sen-003',
          date: '2026-11-15',
          mealType: 'Breakfast',
          mealEatenPercent: 85,
          fluidIntakeMl: 250,
          swallowingDifficulty: false,
          dietitianFeedback: 'Within daily 1500mL renal fluid allowance.'
        }
      ]
    },
    {
      id: 'col-iot-sensors',
      name: 'IoT Room & Bed Sensor Feeds',
      description: 'Arbitrary high-throughput telemetric data from smart mattresses, radar, and motion beacons',
      icon: 'cpu',
      schema: [
        { key: 'timestamp', label: 'Timestamp', type: 'text', required: true },
        { key: 'sensorId', label: 'Sensor Device ID', type: 'text', required: true },
        { key: 'location', label: 'Location Zone', type: 'select', options: ['Bed', 'Bathroom', 'Doorway', 'Living Room Chair'], required: true },
        { key: 'motionLevel', label: 'Motion Magnitude (0-100)', type: 'number', required: true },
        { key: 'inBedState', label: 'Occupancy Detected', type: 'boolean', required: true },
        { key: 'ambientTempF', label: 'Room Temp (°F)', type: 'number', required: false },
        { key: 'rawTelemetryJson', label: 'Payload Raw Data', type: 'text', required: false }
      ],
      records: [
        {
          id: 'rec-iot-1',
          seniorId: 'sen-001',
          timestamp: '2026-11-15T07:15:00Z',
          sensorId: 'RADAR-BED-204',
          location: 'Bed',
          motionLevel: 12,
          inBedState: false,
          ambientTempF: 71.4,
          rawTelemetryJson: '{"respiration_rate":16,"micro_vibrations":0.04}'
        },
        {
          id: 'rec-iot-2',
          seniorId: 'sen-002',
          timestamp: '2026-11-15T07:22:00Z',
          sensorId: 'RADAR-BED-112',
          location: 'Bed',
          motionLevel: 4,
          inBedState: true,
          ambientTempF: 70.8,
          rawTelemetryJson: '{"respiration_rate":18,"micro_vibrations":0.02}'
        }
      ]
    }
  ]
};

// --- Helper Functions ---
function generateId(prefix = 'id') {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

// --- API Endpoints ---

// 1. Healthcheck for Cloud Run
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    platform: 'AegisCare Elderly & Medication Platform',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    cloudEnvironment: process.env.K_SERVICE ? 'Google Cloud Run' : 'Local / On-Prem'
  });
});

// 2. High-Level Dashboard Summary
app.get('/api/summary', (req, res) => {
  const totalSeniors = db.seniors.length;
  const totalMedications = db.medications.length;
  const lowStockMeds = db.medications.filter(m => m.stock <= m.refillThreshold).length;
  
  let dosesLoggedToday = 0;
  const todayStr = new Date().toISOString().slice(0, 10);
  db.medications.forEach(m => {
    (m.logs || []).forEach(l => {
      if (l.date === todayStr) dosesLoggedToday++;
    });
  });

  const totalDynamicCollections = db.dynamicCollections.length;
  const totalDynamicRecords = db.dynamicCollections.reduce((acc, c) => acc + (c.records ? c.records.length : 0), 0);
  const activeAlerts = db.alerts.filter(a => !a.resolved);

  res.json({
    totalSeniors,
    totalMedications,
    lowStockMeds,
    dosesLoggedToday,
    totalDynamicCollections,
    totalDynamicRecords,
    activeAlertsCount: activeAlerts.length,
    alerts: activeAlerts.slice(0, 5)
  });
});

// 3. Seniors CRUD
app.get('/api/seniors', (req, res) => {
  const { search, limit = 100, page = 1 } = req.query;
  let results = [...db.seniors];

  if (search) {
    const q = search.toLowerCase();
    results = results.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.room.toLowerCase().includes(q) ||
      s.conditions.some(c => c.toLowerCase().includes(q))
    );
  }

  const startIndex = (page - 1) * limit;
  const paginated = results.slice(startIndex, startIndex + Number(limit));

  res.json({
    data: paginated,
    total: results.length,
    page: Number(page),
    limit: Number(limit)
  });
});

app.post('/api/seniors', (req, res) => {
  const { name, age, room, emergencyContact, doctor, allergies, conditions, dietary, mobility, notes } = req.body;
  if (!name) return res.status(400).json({ error: 'Resident name is required' });

  const newSenior = {
    id: generateId('sen'),
    name,
    age: Number(age) || 75,
    room: room || 'Room Unassigned',
    avatar: req.body.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
    emergencyContact: emergencyContact || { name: 'Emergency Services', phone: '911' },
    doctor: doctor || 'Attending Physician',
    allergies: Array.isArray(allergies) ? allergies : (allergies ? allergies.split(',').map(s => s.trim()) : []),
    conditions: Array.isArray(conditions) ? conditions : (conditions ? conditions.split(',').map(s => s.trim()) : []),
    dietary: dietary || 'Standard',
    mobility: mobility || 'Independent',
    notes: notes || '',
    createdAt: new Date().toISOString()
  };

  db.seniors.unshift(newSenior);
  res.status(201).json(newSenior);
});

app.put('/api/seniors/:id', (req, res) => {
  const index = db.seniors.findIndex(s => s.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Senior not found' });

  db.seniors[index] = { ...db.seniors[index], ...req.body, id: req.params.id };
  res.json(db.seniors[index]);
});

app.delete('/api/seniors/:id', (req, res) => {
  const index = db.seniors.findIndex(s => s.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Senior not found' });

  const deleted = db.seniors.splice(index, 1);
  // Also clean up associated medications and vitals
  db.medications = db.medications.filter(m => m.seniorId !== req.params.id);
  db.vitals = db.vitals.filter(v => v.seniorId !== req.params.id);

  res.json({ message: 'Senior and associated records deleted', senior: deleted[0] });
});

// 4. Medications & Adherence CRUD
app.get('/api/medications', (req, res) => {
  const { seniorId, lowStockOnly } = req.query;
  let list = [...db.medications];

  if (seniorId) {
    list = list.filter(m => m.seniorId === seniorId);
  }
  if (lowStockOnly === 'true') {
    list = list.filter(m => m.stock <= m.refillThreshold);
  }

  // Enrich with senior name
  const enriched = list.map(m => {
    const senior = db.seniors.find(s => s.id === m.seniorId);
    return {
      ...m,
      seniorName: senior ? senior.name : 'Unknown Senior',
      seniorRoom: senior ? senior.room : 'N/A'
    };
  });

  res.json({ data: enriched, total: enriched.length });
});

app.post('/api/medications', (req, res) => {
  const { seniorId, name, dosage, form, frequency, time, instructions, purpose, stock, refillThreshold, prescribedBy } = req.body;
  if (!seniorId || !name) return res.status(400).json({ error: 'Senior ID and Medication Name are required' });

  const newMed = {
    id: generateId('med'),
    seniorId,
    name,
    dosage: dosage || 'As Directed',
    form: form || 'Tablet',
    frequency: frequency || 'Daily',
    time: time || '08:00',
    instructions: instructions || 'Take with food',
    purpose: purpose || 'Health Maintenance',
    stock: Number(stock) || 30,
    refillThreshold: Number(refillThreshold) || 7,
    prescribedBy: prescribedBy || 'Primary Physician',
    status: 'active',
    logs: []
  };

  db.medications.unshift(newMed);
  res.status(201).json(newMed);
});

// Log dose administration (taken, missed, snoozed)
app.post('/api/medications/:id/log', (req, res) => {
  const med = db.medications.find(m => m.id === req.params.id);
  if (!med) return res.status(404).json({ error: 'Medication not found' });

  const { status, caregiver = 'On-duty Caregiver', notes = '' } = req.body;
  const now = new Date();
  const logEntry = {
    id: generateId('log'),
    date: now.toISOString().slice(0, 10),
    time: now.toTimeString().slice(0, 5),
    timestamp: now.toISOString(),
    status: status || 'taken',
    caregiver,
    notes
  };

  if (status === 'taken' && med.stock > 0) {
    med.stock -= 1;
    if (med.stock <= med.refillThreshold) {
      const senior = db.seniors.find(s => s.id === med.seniorId);
      db.alerts.unshift({
        id: generateId('alt'),
        seniorId: med.seniorId,
        seniorName: senior ? senior.name : 'Unknown',
        type: 'REFILL_NEEDED',
        severity: 'warning',
        message: `Inventory low for ${med.name} (${med.stock} remaining). Please refill.`,
        timestamp: new Date().toISOString(),
        resolved: false
      });
    }
  }

  med.logs = med.logs || [];
  med.logs.unshift(logEntry);

  res.json({ message: 'Dose status logged successfully', medication: med, log: logEntry });
});

app.delete('/api/medications/:id', (req, res) => {
  const index = db.medications.findIndex(m => m.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Medication not found' });
  const deleted = db.medications.splice(index, 1);
  res.json({ message: 'Medication deleted', medication: deleted[0] });
});

// 5. Vitals Recording & Analytics
app.get('/api/vitals', (req, res) => {
  const { seniorId, limit = 50 } = req.query;
  let list = [...db.vitals];
  if (seniorId) {
    list = list.filter(v => v.seniorId === seniorId);
  }
  list.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  res.json({ data: list.slice(0, Number(limit)) });
});

app.post('/api/vitals', (req, res) => {
  const { seniorId, systolic, diastolic, heartRate, bloodSugar, oxygenSaturation, temperature, painLevel, notes } = req.body;
  if (!seniorId) return res.status(400).json({ error: 'Senior ID is required' });

  const record = {
    id: generateId('vit'),
    seniorId,
    timestamp: new Date().toISOString(),
    systolic: Number(systolic) || 120,
    diastolic: Number(diastolic) || 80,
    heartRate: Number(heartRate) || 72,
    bloodSugar: Number(bloodSugar) || 100,
    oxygenSaturation: Number(oxygenSaturation) || 98,
    temperature: Number(temperature) || 98.6,
    painLevel: Number(painLevel) || 0,
    notes: notes || 'Vitals checked.'
  };

  // Critical threshold check & alert creation
  if (record.systolic > 160 || record.bloodSugar > 220 || record.oxygenSaturation < 92) {
    const senior = db.seniors.find(s => s.id === seniorId);
    db.alerts.unshift({
      id: generateId('alt'),
      seniorId,
      seniorName: senior ? senior.name : 'Unknown',
      type: 'CRITICAL_VITALS',
      severity: 'danger',
      message: `Critical vital recorded for ${senior ? senior.name : 'Resident'}: BP ${record.systolic}/${record.diastolic}, O2 ${record.oxygenSaturation}%, Sugar ${record.bloodSugar}mg/dL`,
      timestamp: new Date().toISOString(),
      resolved: false
    });
  }

  db.vitals.unshift(record);
  res.status(201).json(record);
});

// 6. SOS Emergency Panic & Alerts
app.post('/api/sos', (req, res) => {
  const { seniorId, location, reason = 'Emergency SOS Button Triggered' } = req.body;
  const senior = db.seniors.find(s => s.id === seniorId);

  const sosAlert = {
    id: generateId('sos'),
    seniorId: seniorId || 'all',
    seniorName: senior ? senior.name : 'Emergency Beacon',
    room: senior ? senior.room : location || 'Common Area',
    type: 'EMERGENCY_SOS',
    severity: 'danger',
    message: `🚨 IMMEDIATE ASSISTANCE REQUIRED: ${reason} at ${senior ? senior.room : location || 'Facility'}!`,
    timestamp: new Date().toISOString(),
    resolved: false
  };

  db.alerts.unshift(sosAlert);
  res.status(201).json({ message: 'Emergency alert dispatched!', alert: sosAlert });
});

app.get('/api/alerts', (req, res) => {
  res.json({ data: db.alerts, count: db.alerts.length });
});

app.post('/api/alerts/:id/resolve', (req, res) => {
  const alert = db.alerts.find(a => a.id === req.params.id);
  if (!alert) return res.status(404).json({ error: 'Alert not found' });
  alert.resolved = true;
  alert.resolvedAt = new Date().toISOString();
  alert.resolvedBy = req.body.resolvedBy || 'Attending Staff';
  res.json({ message: 'Alert resolved', alert });
});

// 7. UNIVERSAL DYNAMIC DATA ENGINE: Manage ANY kind of data & ANY number
// Get all dynamic collections
app.get('/api/dynamic-collections', (req, res) => {
  const summary = db.dynamicCollections.map(c => ({
    id: c.id,
    name: c.name,
    description: c.description,
    icon: c.icon,
    schema: c.schema,
    recordCount: (c.records || []).length
  }));
  res.json({ data: summary });
});

// Create a new dynamic collection with custom schema
app.post('/api/dynamic-collections', (req, res) => {
  const { name, description, icon, schema } = req.body;
  if (!name || !Array.isArray(schema) || schema.length === 0) {
    return res.status(400).json({ error: 'Collection name and at least one schema field are required' });
  }

  const newCollection = {
    id: generateId('col'),
    name,
    description: description || 'Custom health and operational collection',
    icon: icon || 'database',
    schema: schema.map(f => ({
      key: f.key.trim().replace(/\s+/g, '_').toLowerCase(),
      label: f.label || f.key,
      type: f.type || 'text', // text, number, select, boolean, date, json
      options: f.options || [],
      required: Boolean(f.required)
    })),
    records: []
  };

  db.dynamicCollections.push(newCollection);
  res.status(201).json(newCollection);
});

// Get records for a specific dynamic collection (supports pagination & filtering for "ANY number")
app.get('/api/dynamic-data/:collectionId', (req, res) => {
  const col = db.dynamicCollections.find(c => c.id === req.params.collectionId);
  if (!col) return res.status(404).json({ error: 'Dynamic collection not found' });

  const { search, seniorId, page = 1, limit = 50, sortBy, sortOrder = 'desc' } = req.query;
  let records = [...(col.records || [])];

  if (seniorId) {
    records = records.filter(r => r.seniorId === seniorId);
  }

  if (search) {
    const q = search.toLowerCase();
    records = records.filter(r =>
      Object.values(r).some(val => String(val).toLowerCase().includes(q))
    );
  }

  // Sorting
  if (sortBy) {
    records.sort((a, b) => {
      const valA = a[sortBy];
      const valB = b[sortBy];
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }

  const pageNum = Number(page);
  const limitNum = Number(limit);
  const startIndex = (pageNum - 1) * limitNum;
  const paginated = records.slice(startIndex, startIndex + limitNum);

  res.json({
    collection: { id: col.id, name: col.name, schema: col.schema },
    data: paginated,
    total: records.length,
    page: pageNum,
    totalPages: Math.ceil(records.length / limitNum) || 1
  });
});

// Insert a record into any dynamic collection
app.post('/api/dynamic-data/:collectionId', (req, res) => {
  const col = db.dynamicCollections.find(c => c.id === req.params.collectionId);
  if (!col) return res.status(404).json({ error: 'Dynamic collection not found' });

  const record = {
    id: generateId('rec'),
    createdAt: new Date().toISOString(),
    ...req.body
  };

  col.records = col.records || [];
  col.records.unshift(record);

  res.status(201).json(record);
});

// Delete a dynamic record
app.delete('/api/dynamic-data/:collectionId/:recordId', (req, res) => {
  const col = db.dynamicCollections.find(c => c.id === req.params.collectionId);
  if (!col) return res.status(404).json({ error: 'Collection not found' });

  const index = col.records.findIndex(r => r.id === req.params.recordId);
  if (index === -1) return res.status(404).json({ error: 'Record not found' });

  const deleted = col.records.splice(index, 1);
  res.json({ message: 'Record deleted', record: deleted[0] });
});

// 8. HIGH-VOLUME SCALE GENERATOR (Handles "ANY number of data" demo for hackathon judges)
app.post('/api/seed', (req, res) => {
  const count = Math.min(Number(req.body.count) || 50, 5000);
  const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson'];
  const doctors = ['Dr. Sarah Adams', 'Dr. Peter Patel', 'Dr. Lisa Wong', 'Dr. Carlos Mendoza', 'Dr. Emily Watson'];
  const commonConditions = ['Hypertension', 'Arthritis', 'Osteoporosis', 'Type 2 Diabetes', 'Glaucoma', 'Mild Cognitive Impairment', 'COPD', 'Atrial Fibrillation'];
  const commonMeds = [
    { name: 'Amlodipine', dosage: '5mg', purpose: 'Hypertension' },
    { name: 'Omeprazole', dosage: '20mg', purpose: 'Acid Reflux' },
    { name: 'Levothyroxine', dosage: '50mcg', purpose: 'Hypothyroidism' },
    { name: 'Furosemide', dosage: '20mg', purpose: 'Edema' },
    { name: 'Gabapentin', dosage: '100mg', purpose: 'Neuropathy' }
  ];

  const addedSeniors = [];
  for (let i = 0; i < count; i++) {
    const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
    const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
    const seniorId = `sen-bulk-${Date.now()}-${i}`;
    const senior = {
      id: seniorId,
      name: `${fn} ${ln}`,
      age: Math.floor(Math.random() * 25) + 68,
      room: `Wing ${String.fromCharCode(65 + Math.floor(Math.random() * 4))}-${Math.floor(Math.random() * 90) + 100}`,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fn + ' ' + ln)}`,
      emergencyContact: { name: `Family of ${fn}`, phone: `+1 (555) 01${Math.floor(Math.random() * 90) + 10}` },
      doctor: doctors[Math.floor(Math.random() * doctors.length)],
      allergies: Math.random() > 0.5 ? ['Penicillin'] : ['None reported'],
      conditions: [commonConditions[Math.floor(Math.random() * commonConditions.length)]],
      dietary: 'Regular Care Plan',
      mobility: Math.random() > 0.6 ? 'Walker' : 'Independent',
      notes: 'Bulk generated patient record for high-volume hackathon stress test.',
      createdAt: new Date().toISOString()
    };
    db.seniors.push(senior);
    addedSeniors.push(senior);

    // Add 1-2 medications for this senior
    const medChoice = commonMeds[Math.floor(Math.random() * commonMeds.length)];
    db.medications.push({
      id: `med-bulk-${Date.now()}-${i}`,
      seniorId: seniorId,
      name: medChoice.name,
      dosage: medChoice.dosage,
      form: 'Tablet',
      frequency: 'Daily (Morning)',
      time: '08:00',
      instructions: 'Take with morning meal',
      purpose: medChoice.purpose,
      stock: Math.floor(Math.random() * 40) + 5,
      refillThreshold: 10,
      prescribedBy: senior.doctor,
      status: 'active',
      logs: []
    });

    // Add vitals record
    db.vitals.push({
      id: `vit-bulk-${Date.now()}-${i}`,
      seniorId: seniorId,
      timestamp: new Date().toISOString(),
      systolic: Math.floor(Math.random() * 40) + 110,
      diastolic: Math.floor(Math.random() * 25) + 70,
      heartRate: Math.floor(Math.random() * 30) + 60,
      bloodSugar: Math.floor(Math.random() * 60) + 90,
      oxygenSaturation: Math.floor(Math.random() * 4) + 95,
      temperature: 98.6,
      painLevel: Math.floor(Math.random() * 4),
      notes: 'Auto-sampled vitals reading.'
    });
  }

  res.json({
    message: `Successfully generated and indexed ${count} senior records and associated medications & vitals!`,
    totalSeniorsNow: db.seniors.length,
    totalMedicationsNow: db.medications.length,
    totalVitalsNow: db.vitals.length
  });
});

// 9. Data Export & Import (Supports JSON and CSV)
app.get('/api/export', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="aegiscare-database-backup.json"');
  res.send(JSON.stringify(db, null, 2));
});

app.post('/api/import', (req, res) => {
  try {
    const importedData = req.body;
    if (importedData.seniors) db.seniors = importedData.seniors;
    if (importedData.medications) db.medications = importedData.medications;
    if (importedData.vitals) db.vitals = importedData.vitals;
    if (importedData.dynamicCollections) db.dynamicCollections = importedData.dynamicCollections;
    if (importedData.alerts) db.alerts = importedData.alerts;

    res.json({
      message: 'Database imported and restored successfully!',
      seniors: db.seniors.length,
      medications: db.medications.length,
      vitals: db.vitals.length,
      dynamicCollections: db.dynamicCollections.length
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to import database', details: err.message });
  }
});

// Fallback route for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`  🛡️ AegisCare Elderly Care & Medication Platform`);
  console.log(`  🚀 Server listening on port ${PORT}`);
  console.log(`  🌐 Cloud Run Ready URL target: http://0.0.0.0:${PORT}`);
  console.log(`=======================================================`);
});
