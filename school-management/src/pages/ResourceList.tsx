import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Snackbar,
  Alert,
  SelectChangeEvent
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { IResource } from '../database/SchoolDatabase';
import { resourceManager } from '../models/ResourceManager';

// Types de ressources disponibles
const RESOURCE_TYPES = ['Livre', 'Ordinateur', 'Projecteur', 'Tablette', 'Matériel de laboratoire', 'Instrument de musique'];

export const ResourceList = () => {
  const [resources, setResources] = useState<IResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [newResource, setNewResource] = useState({
    name: '',
    type: '',
    status: 'available' as 'available' | 'inUse' | 'maintenance'
  });
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  // Charger la liste des ressources
  const loadResources = async () => {
    try {
      setLoading(true);
      const data = await resourceManager.getAllResources();
      setResources(data);
    } catch (error) {
      console.error('Erreur lors du chargement des ressources:', error);
      showNotification('Erreur lors du chargement des ressources', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

  // Gérer l'ouverture du dialogue d'ajout de ressource
  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  // Gérer la fermeture du dialogue
  const handleCloseDialog = () => {
    setOpenDialog(false);
    // Réinitialiser le formulaire
    setNewResource({
      name: '',
      type: '',
      status: 'available'
    });
  };

  // Gérer les changements dans le formulaire
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = event.target;
    setNewResource({
      ...newResource,
      [name as string]: value
    });
  };

  // Gérer les changements dans le select
  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    setNewResource({
      ...newResource,
      [name as string]: value
    });
  };

  // Afficher une notification
  const showNotification = (message: string, severity: 'success' | 'error') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  // Fermer la notification
  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };

  // Ajouter une nouvelle ressource
  const handleAddResource = async () => {
    try {
      // Vérifier que tous les champs sont remplis
      if (!newResource.name || !newResource.type) {
        showNotification('Veuillez remplir tous les champs', 'error');
        return;
      }

      // Créer une nouvelle ressource
      const resourceId = await resourceManager.addResource({
        name: newResource.name,
        type: newResource.type,
        status: newResource.status
      });

      // Fermer le dialogue et recharger la liste
      handleCloseDialog();
      showNotification('Ressource ajoutée avec succès', 'success');
      loadResources();
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la ressource:', error);
      showNotification('Erreur lors de l\'ajout de la ressource', 'error');
    }
  };

  // Réserver une ressource
  const handleReserveResource = async (id: number) => {
    try {
      const result = await resourceManager.reserveResource(id);
      
      if (result) {
        showNotification('Ressource réservée avec succès', 'success');
        loadResources();
      } else {
        showNotification('Impossible de réserver cette ressource', 'error');
      }
    } catch (error) {
      console.error('Erreur lors de la réservation:', error);
      showNotification('Erreur lors de la réservation', 'error');
    }
  };

  // Libérer une ressource
  const handleReleaseResource = async (id: number) => {
    try {
      const result = await resourceManager.releaseResource(id);
      
      if (result) {
        showNotification('Ressource libérée avec succès', 'success');
        loadResources();
      } else {
        showNotification('Impossible de libérer cette ressource', 'error');
      }
    } catch (error) {
      console.error('Erreur lors de la libération:', error);
      showNotification('Erreur lors de la libération', 'error');
    }
  };

  // Mettre une ressource en maintenance
  const handleMaintenanceResource = async (id: number) => {
    try {
      const resource = await resourceManager.getResourceById(id);
      
      if (!resource) {
        showNotification('Ressource non trouvée', 'error');
        return;
      }
      
      await resourceManager.updateResource(id, {
        status: 'maintenance'
      });
      
      showNotification('Ressource mise en maintenance', 'success');
      loadResources();
    } catch (error) {
      console.error('Erreur lors de la mise en maintenance:', error);
      showNotification('Erreur lors de la mise en maintenance', 'error');
    }
  };

  // Supprimer une ressource
  const handleDeleteResource = async (id: number) => {
    try {
      if (window.confirm('Êtes-vous sûr de vouloir supprimer cette ressource ?')) {
        await resourceManager.deleteResource(id);
        showNotification('Ressource supprimée avec succès', 'success');
        loadResources();
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      showNotification('Erreur lors de la suppression', 'error');
    }
  };

  // Obtenir la couleur pour le statut
  const getStatusColor = (status: string): 'success' | 'info' | 'error' => {
    switch (status) {
      case 'available':
        return 'success';
      case 'inUse':
        return 'info';
      case 'maintenance':
        return 'error';
      default:
        return 'info';
    }
  };

  // Traduire le statut en français
  const translateStatus = (status: string): string => {
    switch (status) {
      case 'available':
        return 'Disponible';
      case 'inUse':
        return 'En utilisation';
      case 'maintenance':
        return 'En maintenance';
      default:
        return status;
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Liste des Ressources</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          Ajouter une ressource
        </Button>
      </Box>

      {/* Statistiques des ressources */}
      <Box mb={3}>
        <Paper>
          <Box p={2}>
            <Typography variant="h6" gutterBottom>Statistiques des ressources</Typography>
            <Box display="flex" flexWrap="wrap" gap={2}>
              <Box sx={{ width: { xs: '50%', sm: '23%' } }}>
                <Typography color="textSecondary">Total</Typography>
                <Typography variant="h5">{resources.length}</Typography>
              </Box>
              <Box sx={{ width: { xs: '50%', sm: '23%' } }}>
                <Typography color="textSecondary">Disponibles</Typography>
                <Typography variant="h5" color="success.main">
                  {resources.filter(r => r.status === 'available').length}
                </Typography>
              </Box>
              <Box sx={{ width: { xs: '50%', sm: '23%' } }}>
                <Typography color="textSecondary">En utilisation</Typography>
                <Typography variant="h5" color="info.main">
                  {resources.filter(r => r.status === 'inUse').length}
                </Typography>
              </Box>
              <Box sx={{ width: { xs: '50%', sm: '23%' } }}>
                <Typography color="textSecondary">En maintenance</Typography>
                <Typography variant="h5" color="error.main">
                  {resources.filter(r => r.status === 'maintenance').length}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Tableau des ressources */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nom</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Dernière réservation</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">Chargement...</TableCell>
              </TableRow>
            ) : resources.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">Aucune ressource trouvée</TableCell>
              </TableRow>
            ) : (
              resources.map((resource) => (
                <TableRow key={resource.id}>
                  <TableCell>{resource.id}</TableCell>
                  <TableCell>{resource.name}</TableCell>
                  <TableCell>{resource.type}</TableCell>
                  <TableCell>
                    <Chip 
                      label={translateStatus(resource.status)} 
                      color={getStatusColor(resource.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {resource.lastReservationDate 
                      ? new Date(resource.lastReservationDate).toLocaleDateString() 
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1} flexWrap="wrap">
                      {resource.status === 'available' && (
                        <Button 
                          size="small" 
                          variant="outlined" 
                          color="primary"
                          onClick={() => handleReserveResource(resource.id!)}
                        >
                          Réserver
                        </Button>
                      )}
                      {resource.status === 'inUse' && (
                        <Button 
                          size="small" 
                          variant="outlined" 
                          color="info"
                          onClick={() => handleReleaseResource(resource.id!)}
                        >
                          Libérer
                        </Button>
                      )}
                      {resource.status !== 'maintenance' && (
                        <Button 
                          size="small" 
                          variant="outlined" 
                          color="warning"
                          onClick={() => handleMaintenanceResource(resource.id!)}
                        >
                          Maintenance
                        </Button>
                      )}
                      <Button 
                        size="small" 
                        variant="outlined" 
                        color="error"
                        onClick={() => handleDeleteResource(resource.id!)}
                      >
                        Supprimer
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialogue pour ajouter une ressource */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Ajouter une nouvelle ressource</DialogTitle>
        <DialogContent>
          <Box mt={2} display="flex" flexDirection="column" gap={2}>
            <TextField
              autoFocus
              margin="dense"
              name="name"
              label="Nom de la ressource"
              fullWidth
              value={newResource.name}
              onChange={handleInputChange}
            />
            <FormControl fullWidth margin="dense">
              <InputLabel>Type de ressource</InputLabel>
              <Select
                name="type"
                value={newResource.type}
                label="Type de ressource"
                onChange={handleSelectChange}
              >
                {RESOURCE_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="dense">
              <InputLabel>Statut</InputLabel>
              <Select
                name="status"
                value={newResource.status}
                label="Statut"
                onChange={handleSelectChange}
              >
                <MenuItem value="available">Disponible</MenuItem>
                <MenuItem value="inUse">En utilisation</MenuItem>
                <MenuItem value="maintenance">En maintenance</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            Annuler
          </Button>
          <Button onClick={handleAddResource} color="primary">
            Ajouter
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}; 