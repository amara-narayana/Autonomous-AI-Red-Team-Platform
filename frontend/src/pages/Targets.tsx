import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { targetsService } from '../../services/api';
import { Target } from '../../types';

const Targets: React.FC = () => {
  const [newTarget, setNewTarget] = useState({ name: '', url: '', description: '' });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState({ name: '', url: '', description: '' });
  const queryClient = useQueryClient();

  const { data: targets, isLoading } = useQuery({
    queryKey: ['targets'],
    queryFn: async () => {
      const response = await targetsService.list();
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: { name: string; url: string; description?: string }) => 
      targetsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['targets'] });
      setNewTarget({ name: '', url: '', description: '' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => targetsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['targets'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      targetsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['targets'] });
      setEditingId(null);
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(newTarget);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this target?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (target: Target) => {
    setEditingId(target.id);
    setEditData({ 
      name: target.name, 
      url: target.url, 
      description: target.description || '' 
    });
  };

  const handleUpdate = (id: number) => {
    updateMutation.mutate({ id, data: editData });
  };

  if (isLoading) {
    return <div>Loading targets...</div>;
  }

  return (
    <div>
      <h1>Manage Targets</h1>
      
      <div style={{ marginBottom: '30px', background: '#16213e', padding: '20px', borderRadius: '8px' }}>
        <h2>Add New Target</h2>
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input
            type="text"
            placeholder="Target Name"
            value={newTarget.name}
            onChange={(e) => setNewTarget({ ...newTarget, name: e.target.value })}
            style={{ padding: '10px', background: '#1a1a2e', border: '1px solid #0f3460', color: '#eee', borderRadius: '4px' }}
            required
          />
          <input
            type="url"
            placeholder="Target URL"
            value={newTarget.url}
            onChange={(e) => setNewTarget({ ...newTarget, url: e.target.value })}
            style={{ padding: '10px', background: '#1a1a2e', border: '1px solid #0f3460', color: '#eee', borderRadius: '4px' }}
            required
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={newTarget.description}
            onChange={(e) => setNewTarget({ ...newTarget, description: e.target.value })}
            style={{ padding: '10px', background: '#1a1a2e', border: '1px solid #0f3460', color: '#eee', borderRadius: '4px' }}
          />
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
            {createMutation.isPending ? 'Adding...' : 'Add Target'}
          </button>
        </form>
      </div>

      <div>
        <h2>Existing Targets</h2>
        {targets && targets.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #0f3460' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>URL</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Description</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {targets.map((target: Target) => (
                <tr key={target.id} style={{ borderBottom: '1px solid #16213e' }}>
                  <td style={{ padding: '12px' }}>
                    {editingId === target.id ? (
                      <input
                        value={editData.name}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        style={{ padding: '5px', background: '#1a1a2e', border: '1px solid #0f3460', color: '#eee' }}
                      />
                    ) : (
                      target.name
                    )}
                  </td>
                  <td style={{ padding: '12px' }}>
                    {editingId === target.id ? (
                      <input
                        value={editData.url}
                        onChange={(e) => setEditData({ ...editData, url: e.target.value })}
                        style={{ padding: '5px', background: '#1a1a2e', border: '1px solid #0f3460', color: '#eee' }}
                      />
                    ) : (
                      <a href={target.url} target="_blank" rel="noopener noreferrer" style={{ color: '#61dafb' }}>
                        {target.url}
                      </a>
                    )}
                  </td>
                  <td style={{ padding: '12px' }}>
                    {editingId === target.id ? (
                      <input
                        value={editData.description}
                        onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                        style={{ padding: '5px', background: '#1a1a2e', border: '1px solid #0f3460', color: '#eee' }}
                      />
                    ) : (
                      target.description || '-'
                    )}
                  </td>
                  <td style={{ padding: '12px' }}>
                    {editingId === target.id ? (
                      <>
                        <button 
                          onClick={() => handleUpdate(target.id)}
                          style={{ 
                            padding: '5px 10px', 
                            background: '#4caf50', 
                            color: '#fff', 
                            border: 'none', 
                            borderRadius: '4px',
                            cursor: 'pointer',
                            marginRight: '5px'
                          }}
                        >
                          Save
                        </button>
                        <button 
                          onClick={() => setEditingId(null)}
                          style={{ 
                            padding: '5px 10px', 
                            background: '#666', 
                            color: '#fff', 
                            border: 'none', 
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          onClick={() => handleEdit(target)}
                          style={{ 
                            padding: '5px 10px', 
                            background: '#2196f3', 
                            color: '#fff', 
                            border: 'none', 
                            borderRadius: '4px',
                            cursor: 'pointer',
                            marginRight: '5px'
                          }}
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(target.id)}
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
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No targets found. Add your first target above.</p>
        )}
      </div>
    </div>
  );
};

export default Targets;
