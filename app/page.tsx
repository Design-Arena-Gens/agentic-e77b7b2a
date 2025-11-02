'use client';

import { useState, useEffect } from 'react';
import { Blockchain, PatientData } from '@/lib/blockchain';

type Tab = 'add' | 'view' | 'patients';

export default function Home() {
  const [blockchain, setBlockchain] = useState<Blockchain | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('add');
  const [mining, setMining] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    age: '',
    gender: '',
    bloodType: '',
    diagnosis: '',
    treatment: '',
    doctor: ''
  });

  useEffect(() => {
    const savedChain = localStorage.getItem('patientBlockchain');
    if (savedChain) {
      try {
        const loadedBlockchain = Blockchain.fromJSON(savedChain);
        setBlockchain(loadedBlockchain);
      } catch (error) {
        const newBlockchain = new Blockchain();
        setBlockchain(newBlockchain);
      }
    } else {
      const newBlockchain = new Blockchain();
      setBlockchain(newBlockchain);
    }
  }, []);

  useEffect(() => {
    if (blockchain) {
      localStorage.setItem('patientBlockchain', blockchain.toJSON());
    }
  }, [blockchain]);

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!blockchain) return;

    if (!formData.id || !formData.name || !formData.age || !formData.gender ||
        !formData.bloodType || !formData.diagnosis || !formData.treatment || !formData.doctor) {
      showAlert('error', 'Please fill in all fields');
      return;
    }

    setMining(true);

    setTimeout(() => {
      const patientData: PatientData = {
        id: formData.id,
        name: formData.name,
        age: parseInt(formData.age),
        gender: formData.gender,
        bloodType: formData.bloodType,
        diagnosis: formData.diagnosis,
        treatment: formData.treatment,
        doctor: formData.doctor,
        timestamp: Date.now()
      };

      const newBlockchain = Object.assign(Object.create(Object.getPrototypeOf(blockchain)), blockchain);
      newBlockchain.addBlock(patientData);
      setBlockchain(newBlockchain);

      setFormData({
        id: '',
        name: '',
        age: '',
        gender: '',
        bloodType: '',
        diagnosis: '',
        treatment: '',
        doctor: ''
      });

      setMining(false);
      showAlert('success', `Patient ${formData.name} added to blockchain successfully!`);
      setActiveTab('view');
    }, 1500);
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  if (!blockchain) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ width: '40px', height: '40px', borderWidth: '4px', margin: '0 auto 20px' }}></div>
          <div>Initializing Blockchain...</div>
        </div>
      </div>
    );
  }

  const isChainValid = blockchain.isChainValid();
  const totalBlocks = blockchain.chain.length;
  const totalPatients = totalBlocks - 1;

  return (
    <div className="container">
      <div className="header">
        <h1>🏥 Patient Blockchain System</h1>
        <p>Secure & Transparent Patient Information Management</p>
      </div>

      <div className="tabs">
        <button
          className={`tab-button ${activeTab === 'add' ? 'active' : ''}`}
          onClick={() => setActiveTab('add')}
        >
          ➕ Add Patient
        </button>
        <button
          className={`tab-button ${activeTab === 'view' ? 'active' : ''}`}
          onClick={() => setActiveTab('view')}
        >
          🔗 View Blockchain
        </button>
        <button
          className={`tab-button ${activeTab === 'patients' ? 'active' : ''}`}
          onClick={() => setActiveTab('patients')}
        >
          👥 All Patients
        </button>
      </div>

      {alert && (
        <div className={`alert ${alert.type === 'success' ? 'alert-success' : 'alert-error'}`}>
          {alert.message}
        </div>
      )}

      {activeTab === 'add' && (
        <div className="card">
          <h2 style={{ marginBottom: '20px', color: '#667eea' }}>Add New Patient Record</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Patient ID *</label>
                <input
                  type="text"
                  name="id"
                  value={formData.id}
                  onChange={handleInputChange}
                  placeholder="P001"
                  required
                />
              </div>
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Age *</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  placeholder="25"
                  min="0"
                  max="150"
                  required
                />
              </div>
              <div className="form-group">
                <label>Gender *</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Blood Type *</label>
                <select
                  name="bloodType"
                  value={formData.bloodType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Blood Type</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Diagnosis *</label>
              <textarea
                name="diagnosis"
                value={formData.diagnosis}
                onChange={handleInputChange}
                placeholder="Enter patient diagnosis"
                required
              />
            </div>

            <div className="form-group">
              <label>Treatment Plan *</label>
              <textarea
                name="treatment"
                value={formData.treatment}
                onChange={handleInputChange}
                placeholder="Enter treatment plan"
                required
              />
            </div>

            <div className="form-group">
              <label>Doctor Name *</label>
              <input
                type="text"
                name="doctor"
                value={formData.doctor}
                onChange={handleInputChange}
                placeholder="Dr. Smith"
                required
              />
            </div>

            <button type="submit" className="submit-button" disabled={mining}>
              {mining ? (
                <>
                  Mining Block
                  <span className="mining-animation">
                    <span className="spinner"></span>
                  </span>
                </>
              ) : (
                '💾 Add to Blockchain'
              )}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'view' && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{totalBlocks}</div>
              <div className="stat-label">Total Blocks</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{totalPatients}</div>
              <div className="stat-label">Patient Records</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{isChainValid ? '✓' : '✗'}</div>
              <div className="stat-label">Chain {isChainValid ? 'Valid' : 'Invalid'}</div>
            </div>
          </div>

          <div className="blockchain-container">
            {blockchain.chain.map((block, index) => (
              <div key={index}>
                <div className="block-card">
                  <div className="block-header">
                    <span className="block-index">
                      {block.index === 0 ? '🌟 Genesis Block' : `Block #${block.index}`}
                    </span>
                    <span className="block-timestamp">
                      {formatTimestamp(block.timestamp)}
                    </span>
                  </div>

                  <div className="patient-info">
                    <div className="info-item">
                      <div className="info-label">Patient ID</div>
                      <div className="info-value">{block.data.id}</div>
                    </div>
                    <div className="info-item">
                      <div className="info-label">Name</div>
                      <div className="info-value">{block.data.name}</div>
                    </div>
                    <div className="info-item">
                      <div className="info-label">Age</div>
                      <div className="info-value">{block.data.age}</div>
                    </div>
                    <div className="info-item">
                      <div className="info-label">Gender</div>
                      <div className="info-value">{block.data.gender}</div>
                    </div>
                    <div className="info-item">
                      <div className="info-label">Blood Type</div>
                      <div className="info-value">{block.data.bloodType}</div>
                    </div>
                    <div className="info-item">
                      <div className="info-label">Doctor</div>
                      <div className="info-value">{block.data.doctor}</div>
                    </div>
                  </div>

                  <div className="patient-info">
                    <div className="info-item" style={{ gridColumn: '1 / -1' }}>
                      <div className="info-label">Diagnosis</div>
                      <div className="info-value">{block.data.diagnosis}</div>
                    </div>
                    <div className="info-item" style={{ gridColumn: '1 / -1' }}>
                      <div className="info-label">Treatment</div>
                      <div className="info-value">{block.data.treatment}</div>
                    </div>
                  </div>

                  <div className="hash-section">
                    <div className="hash-item">
                      <div className="hash-label">Block Hash</div>
                      <div className="hash-value">{block.hash}</div>
                    </div>
                    <div className="hash-item">
                      <div className="hash-label">Previous Hash</div>
                      <div className="hash-value">{block.previousHash}</div>
                    </div>
                    <div className="hash-item">
                      <div className="hash-label">Nonce</div>
                      <div className="hash-value">{block.nonce}</div>
                    </div>
                  </div>
                </div>

                {index < blockchain.chain.length - 1 && (
                  <div className="block-connector">
                    <div className="connector-line"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === 'patients' && (
        <div>
          <div className="stats-grid" style={{ marginBottom: '20px' }}>
            <div className="stat-card">
              <div className="stat-value">{totalPatients}</div>
              <div className="stat-label">Total Patients</div>
            </div>
          </div>

          {totalPatients === 0 ? (
            <div className="card">
              <div className="no-data">
                <div className="no-data-icon">📋</div>
                <div className="no-data-text">No patient records yet</div>
                <p style={{ marginTop: '10px', color: '#999' }}>
                  Add your first patient to get started
                </p>
              </div>
            </div>
          ) : (
            <div className="patient-list">
              {blockchain.getAllPatients().map((patient, index) => (
                <div key={index} className="patient-card">
                  <div className="patient-header">
                    <div className="patient-name">{patient.name}</div>
                    <div className="patient-id">{patient.id}</div>
                  </div>
                  <div className="patient-info">
                    <div className="info-item">
                      <div className="info-label">Age</div>
                      <div className="info-value">{patient.age} years</div>
                    </div>
                    <div className="info-item">
                      <div className="info-label">Gender</div>
                      <div className="info-value">{patient.gender}</div>
                    </div>
                    <div className="info-item">
                      <div className="info-label">Blood Type</div>
                      <div className="info-value">{patient.bloodType}</div>
                    </div>
                    <div className="info-item">
                      <div className="info-label">Doctor</div>
                      <div className="info-value">{patient.doctor}</div>
                    </div>
                  </div>
                  <div className="patient-info" style={{ marginTop: '15px' }}>
                    <div className="info-item" style={{ gridColumn: '1 / -1' }}>
                      <div className="info-label">Diagnosis</div>
                      <div className="info-value">{patient.diagnosis}</div>
                    </div>
                    <div className="info-item" style={{ gridColumn: '1 / -1' }}>
                      <div className="info-label">Treatment</div>
                      <div className="info-value">{patient.treatment}</div>
                    </div>
                  </div>
                  <div style={{ marginTop: '10px', fontSize: '0.85rem', color: '#999' }}>
                    Added: {formatTimestamp(patient.timestamp)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
