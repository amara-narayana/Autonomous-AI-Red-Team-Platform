import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { scansService, targetsService } from '../../services/api';
import { Scan, Target } from '../../types';

const Scans: React.FC = () => {
  const [newScan, setNewScan] = useState({ name: '', scan_type: 'nmap', target_id: 0 });
  const queryClient = useQueryClient();

  const { data: scans, isLoading: scansLoading } = useQuery({
    queryKey: ['scans'],
    queryFn: async () => {
      const response = await scansService.list();
      return response.data;
    },
  });

  const { data: targets, isLoading: targetsLoading } = useQuery({
    queryKey: ['targets'],
    queryFn: async () => {
      const response = await targetsService.list();
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: { name: string; scan_type: string; target_id: number }) => 
      scansService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scans'] });
      setNewScan({ name: '', scan_type: 'nmap', target_id: 0 });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => scansService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scans'] });
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newScan.target_id === 0) {
      alert('Please select a target');
      return;
    }
    createMutation.mutate(newScan);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this scan?')) {
      deleteMutation.mutate(id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return '#ffbb33';
      case 'running': return '#2196f3';
      case 'completed': return '#4caf50';
      case 'failed': return '#f44336';
      default: return '#666';
    }
  };

  if (scansLoading || targetsLoading) {
    return <div>Loading scans...</div>;
  }

  return (
    <div>
      <h1>Security Scans</h1>
      
      <div style={{ marginBottom: '30px', background: '#16213e', padding: '20px', borderRadius: '8px' }}>
        <h2>Create New Scan</h2>
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input
            type="text"
            placeholder="Scan Name"
            value={newScan.name}
            onChange={(e) => setNewScan({ ...newScan, name: e.target.value })}
            style={{ padding: '10px', background: '#1a1a2e', border: '1px solid #0f3460', color: '#eee', borderRadius: '4px' }}
            required
          />
          <select
            value={newScan.scan_type}
            onChange={(e) => setNewScan({ ...newScan, scan_type: e.target.value })}
            style={{ padding: '10px', background: '#1a1a2e', border: '1px solid #0f3460', color: '#eee', borderRadius: '4px' }}
          >
            <option value="nmap">Nmap (Network Scan)</option>
            <option value="nikto">Nikto (Web Scanner)</option>
            <option value="gobuster">Gobuster (Directory Bruteforce)</option>
            <option value="sqlmap">SQLMap (SQL Injection)</option>
            <option value="nuclei">Nuclei (Vulnerability Scanner)</option>
          </select>
          <select
            value={newScan.target_id}
            onChange={(e) => setNewScan({ ...newScan, target_id: Number(e.target.value) })}
            style={{ padding: '10px', background: '#1a1a2e', border: '1px solid #0f3460', color: '#eee', borderRadius: '4px' }}
            required
          >
            <option value={0}>Select Target</option>
            {targets && targets.map((target: Target) => (
              <option key={target.id} value={target.id}>{target.name}</option>
            ))}
          </select>
          <button 
            type="submit" 
            disabled={createMutation.isPending}
            style={{ 
              padding: '10px 20px', 
              background: '#e94560', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {createMutation.isPending ? 'Creating...' : 'Start Scan'}
          </button>
        </form>
      </div>

      <div>
        <h2>Scan History</h2>
        {scans && scans.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #0f3460' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Type</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Target</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Created</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {scans.map((scan: Scan) => (
                <tr key={scan.id} style={{ borderBottom: '1px solid #16213e' }}>
                  <td style={{ padding: '12px' }}>{scan.name}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ 
                      background: '#0f3460', 
                      padding: '4px 8px', 
                      borderRadius: '4px',
                      fontSize: '0.85em'
                    }}>
                      {scan.scan_type}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>Target ID: {scan.target_id}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ 
                      background: getStatusColor(scan.status), 
                      padding: '4px 8px', 
                      borderRadius: '4px',
                      color: '#fff',
                      fontSize: '0.85em'
                    }}>
                      {scan.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    {new Date(scan.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <button 
                      onClick={() => handleDelete(scan.id)}
                      style={{ 
                        padding: '5px 10px', 
                        background: '#f44336', 
                        color: '#fff', 
                        border: 'none', 
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No scans found. Create your first scan above.</p>
        )}
      </div>
    </div>
  );
};

export default Scans;
