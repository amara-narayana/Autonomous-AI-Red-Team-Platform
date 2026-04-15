import React, { useState } from 'react';
import { targetsService, scansService, vulnerabilitiesService } from '../services/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Target, Scan, Vulnerability } from '../types';

const Dashboard: React.FC = () => {
  const [newTarget, setNewTarget] = useState({ name: '', url: '', description: '' });
  const queryClient = useQueryClient();

  const { data: targets } = useQuery({
    queryKey: ['targets'],
    queryFn: async () => {
      const response = await targetsService.list();
      return response.data;
    },
  });

  const { data: scans } = useQuery({
    queryKey: ['scans'],
    queryFn: async () => {
      const response = await scansService.list();
      return response.data;
    },
  });

  const { data: vulnerabilities } = useQuery({
    queryKey: ['vulnerabilities'],
    queryFn: async () => {
      const response = await vulnerabilitiesService.list();
      return response.data;
    },
  });

  const handleCreateTarget = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await targetsService.create(newTarget);
      queryClient.invalidateQueries({ queryKey: ['targets'] });
      setNewTarget({ name: '', url: '', description: '' });
    } catch (error) {
      console.error('Error creating target:', error);
    }
  };

  const criticalCount = vulnerabilities?.filter((v: Vulnerability) => v.severity === 'critical').length || 0;
  const highCount = vulnerabilities?.filter((v: Vulnerability) => v.severity === 'high').length || 0;
  const mediumCount = vulnerabilities?.filter((v: Vulnerability) => v.severity === 'medium').length || 0;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Red Team Platform Dashboard</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
        <div style={{ background: '#333', padding: '20px', borderRadius: '8px' }}>
          <h3>Targets</h3>
          <p style={{ fontSize: '2em' }}>{targets?.length || 0}</p>
        </div>
        <div style={{ background: '#333', padding: '20px', borderRadius: '8px' }}>
          <h3>Scans</h3>
          <p style={{ fontSize: '2em' }}>{scans?.length || 0}</p>
        </div>
        <div style={{ background: '#333', padding: '20px', borderRadius: '8px' }}>
          <h3>Vulnerabilities</h3>
          <p style={{ fontSize: '2em' }}>{vulnerabilities?.length || 0}</p>
        </div>
        <div style={{ background: '#333', padding: '20px', borderRadius: '8px' }}>
          <h3>Critical Issues</h3>
          <p style={{ fontSize: '2em', color: '#ff4444' }}>{criticalCount}</p>
        </div>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2>Add New Target</h2>
        <form onSubmit={handleCreateTarget} style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            placeholder="Target Name"
            value={newTarget.name}
            onChange={(e) => setNewTarget({ ...newTarget, name: e.target.value })}
            style={{ padding: '10px', flex: 1 }}
            required
          />
          <input
            type="url"
            placeholder="Target URL"
            value={newTarget.url}
            onChange={(e) => setNewTarget({ ...newTarget, url: e.target.value })}
            style={{ padding: '10px', flex: 1 }}
            required
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={newTarget.description}
            onChange={(e) => setNewTarget({ ...newTarget, description: e.target.value })}
            style={{ padding: '10px', flex: 1 }}
          />
          <button type="submit" style={{ padding: '10px 20px' }}>Add Target</button>
        </form>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2>Vulnerability Summary</h2>
        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ background: '#ff4444', padding: '15px', borderRadius: '8px', flex: 1 }}>
            <strong>Critical:</strong> {criticalCount}
          </div>
          <div style={{ background: '#ff8800', padding: '15px', borderRadius: '8px', flex: 1 }}>
            <strong>High:</strong> {highCount}
          </div>
          <div style={{ background: '#ffbb33', padding: '15px', borderRadius: '8px', flex: 1 }}>
            <strong>Medium:</strong> {mediumCount}
          </div>
        </div>
      </div>

      <nav style={{ marginTop: '40px' }}>
        <h2>Navigation</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li><a href="/targets" style={{ color: '#61dafb' }}>Manage Targets →</a></li>
          <li><a href="/scans" style={{ color: '#61dafb' }}>Run Scans →</a></li>
          <li><a href="/vulnerabilities" style={{ color: '#61dafb' }}>View Vulnerabilities →</a></li>
        </ul>
      </nav>
    </div>
  );
};

export default Dashboard;
