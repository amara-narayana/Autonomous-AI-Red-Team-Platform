import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vulnerabilitiesService, targetsService } from '../../services/api';
import { Vulnerability, Target } from '../../types';

const Vulnerabilities: React.FC = () => {
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const queryClient = useQueryClient();

  const { data: vulnerabilities, isLoading } = useQuery({
    queryKey: ['vulnerabilities'],
    queryFn: async () => {
      const response = await vulnerabilitiesService.list();
      return response.data;
    },
  });

  const { data: targets } = useQuery({
    queryKey: ['targets'],
    queryFn: async () => {
      const response = await targetsService.list();
      return response.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => vulnerabilitiesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vulnerabilities'] });
    },
  });

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this vulnerability?')) {
      deleteMutation.mutate(id);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return '#ff4444';
      case 'high': return '#ff8800';
      case 'medium': return '#ffbb33';
      case 'low': return '#00c851';
      case 'info': return '#2196f3';
      default: return '#666';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open': return '#ff4444';
      case 'in_progress': return '#ffbb33';
      case 'resolved': return '#00c851';
      case 'false_positive': return '#666';
      default: return '#666';
    }
  };

  const filteredVulns = vulnerabilities?.filter((vuln: Vulnerability) => {
    if (filterSeverity !== 'all' && vuln.severity !== filterSeverity) return false;
    if (filterStatus !== 'all' && vuln.status !== filterStatus) return false;
    return true;
  });

  if (isLoading) {
    return <div>Loading vulnerabilities...</div>;
  }

  return (
    <div>
      <h1>Vulnerability Management</h1>
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '15px', alignItems: 'center' }}>
        <div>
          <label style={{ marginRight: '10px' }}>Severity:</label>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            style={{ padding: '8px', background: '#1a1a2e', border: '1px solid #0f3460', color: '#eee', borderRadius: '4px' }}
          >
            <option value="all">All</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
            <option value="info">Info</option>
          </select>
        </div>
        <div>
          <label style={{ marginRight: '10px' }}>Status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ padding: '8px', background: '#1a1a2e', border: '1px solid #0f3460', color: '#eee', borderRadius: '4px' }}
          >
            <option value="all">All</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="false_positive">False Positive</option>
          </select>
        </div>
      </div>

      <div style={{ marginBottom: '20px', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
        {['critical', 'high', 'medium', 'low', 'info'].map(severity => {
          const count = vulnerabilities?.filter((v: Vulnerability) => v.severity === severity).length || 0;
          return (
            <div key={severity} style={{ 
              background: getSeverityColor(severity), 
              padding: '15px', 
              borderRadius: '8px',
              textAlign: 'center',
              color: '#fff',
              fontWeight: 'bold'
            }}>
              <div style={{ fontSize: '2em' }}>{count}</div>
              <div style={{ textTransform: 'capitalize' }}>{severity}</div>
            </div>
          );
        })}
      </div>

      <div>
        <h2>Vulnerabilities ({filteredVulns?.length || 0})</h2>
        {filteredVulns && filteredVulns.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #0f3460' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>Title</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Severity</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>CVSS</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Target</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Created</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVulns.map((vuln: Vulnerability) => (
                <tr key={vuln.id} style={{ borderBottom: '1px solid #16213e' }}>
                  <td style={{ padding: '12px' }}>
                    <div style={{ fontWeight: 'bold' }}>{vuln.title}</div>
                    <div style={{ fontSize: '0.85em', color: '#aaa', marginTop: '4px' }}>
                      {vuln.description?.substring(0, 100)}{vuln.description && vuln.description.length > 100 ? '...' : ''}
                    </div>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ 
                      background: getSeverityColor(vuln.severity), 
                      padding: '4px 8px', 
                      borderRadius: '4px',
                      color: '#fff',
                      fontSize: '0.85em',
                      textTransform: 'capitalize'
                    }}>
                      {vuln.severity}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    {vuln.cvss_score ? (
                      <span style={{ 
                        background: vuln.cvss_score >= 9 ? '#ff4444' : 
                                   vuln.cvss_score >= 7 ? '#ff8800' : 
                                   vuln.cvss_score >= 4 ? '#ffbb33' : '#00c851',
                        padding: '4px 8px', 
                        borderRadius: '4px',
                        color: '#fff',
                        fontWeight: 'bold'
                      }}>
                        {vuln.cvss_score.toFixed(1)}
                      </span>
                    ) : '-'}
                  </td>
                  <td style={{ padding: '12px' }}>Target ID: {vuln.target_id}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ 
                      background: getStatusColor(vuln.status), 
                      padding: '4px 8px', 
                      borderRadius: '4px',
                      color: '#fff',
                      fontSize: '0.85em',
                      textTransform: 'capitalize'
                    }}>
                      {vuln.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    {new Date(vuln.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <button 
                      onClick={() => handleDelete(vuln.id)}
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
          <p>No vulnerabilities found matching the selected filters.</p>
        )}
      </div>
    </div>
  );
};

export default Vulnerabilities;
