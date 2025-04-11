import React, { useEffect, useState, useCallback } from 'react';
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
  Snackbar,
  Alert,
  IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { teacherDAO } from '../daos/TeacherDAO';
import { ITeacher } from '../database/SchoolDatabase';
import { Teacher } from '../models/Teacher';

export const TeacherList = () => {
  const [teachers, setTeachers] = useState<Array<ITeacher & { coursesCount?: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newTeacher, setNewTeacher] = useState({
    id: undefined as number | undefined,
    name: '',
    email: '',
    specialization: ''
  });
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  const showNotification = useCallback((message: string, severity: 'success' | 'error') => {
    setNotification({
      open: true,
      message,
      severity
    });
  }, []);

  const loadTeachers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await teacherDAO.getTeachersWithCourses();
      setTeachers(data);
    } catch (error) {
      console.error('Erreur lors du chargement des enseignants:', error);
      showNotification('Erreur lors du chargement des enseignants', 'error');
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    loadTeachers();
  }, [loadTeachers]);

  const handleOpenDialog = () => {
    setIsEditing(false);
    setNewTeacher({
      id: undefined,
      name: '',
      email: '',
      specialization: ''
    });
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (teacher: ITeacher) => {
    setIsEditing(true);
    setNewTeacher({
      id: teacher.id,
      name: teacher.name,
      email: teacher.email,
      specialization: teacher.specialization
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
    setIsEditing(false);
  }, []);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = event.target;
    setNewTeacher({
      ...newTeacher,
      [name as string]: value
    });
  };

  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };

  const handleDeleteTeacher = useCallback(async (id?: number) => {
    if (!id) return;
    
    try {
      const teacher = teachers.find(t => t.id === id);
      if (teacher && teacher.coursesCount && teacher.coursesCount > 0) {
        const confirmMsg = `Cet enseignant a ${teacher.coursesCount} cours assigné(s). Voulez-vous vraiment le supprimer ? Les cours seront orphelins jusqu'à ce qu'un nouvel enseignant soit assigné.`;
        if (!window.confirm(confirmMsg)) {
          return;
        }
      } else if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet enseignant ?')) {
        return;
      }
      
      await teacherDAO.delete(id);
      showNotification('Enseignant supprimé avec succès', 'success');
      loadTeachers();
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'enseignant:', error);
      showNotification('Erreur lors de la suppression de l\'enseignant', 'error');
    }
  }, [teachers, showNotification, loadTeachers]);

  const handleSaveTeacher = useCallback(async () => {
    try {
      if (!newTeacher.name || !newTeacher.email || !newTeacher.specialization) {
        showNotification('Veuillez remplir tous les champs', 'error');
        return;
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(newTeacher.email)) {
        showNotification('Format d\'email invalide', 'error');
        return;
      }

      const teacherData = {
        ...newTeacher,
        createdAt: isEditing ? (await teacherDAO.getById(newTeacher.id!))?.createdAt || new Date() : new Date()
      };

      const teacher = new Teacher(teacherData);

      if (isEditing) {
        await teacherDAO.update(newTeacher.id!, teacher.toJSON());
        showNotification('Enseignant mis à jour avec succès', 'success');
      } else {
        await teacherDAO.add(teacher.toJSON());
        showNotification('Enseignant ajouté avec succès', 'success');
      }

      handleCloseDialog();
      loadTeachers();
    } catch (error) {
      console.error('Erreur lors de l\'opération sur l\'enseignant:', error);
      showNotification('Erreur lors de l\'opération sur l\'enseignant', 'error');
    }
  }, [newTeacher, isEditing, showNotification, loadTeachers, handleCloseDialog]);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Liste des Enseignants</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          Ajouter un enseignant
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nom</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Spécialisation</TableCell>
              <TableCell>Nombre de cours</TableCell>
              <TableCell>Date d'ajout</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">Chargement...</TableCell>
              </TableRow>
            ) : teachers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">Aucun enseignant trouvé</TableCell>
              </TableRow>
            ) : (
              teachers.map((teacher) => (
                <TableRow key={teacher.id}>
                  <TableCell>{teacher.id}</TableCell>
                  <TableCell>{teacher.name}</TableCell>
                  <TableCell>{teacher.email}</TableCell>
                  <TableCell>{teacher.specialization}</TableCell>
                  <TableCell>{teacher.coursesCount || 0}</TableCell>
                  <TableCell>{new Date(teacher.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <IconButton 
                        color="primary" 
                        size="small" 
                        onClick={() => handleOpenEditDialog(teacher)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        color="error" 
                        size="small" 
                        onClick={() => handleDeleteTeacher(teacher.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditing ? 'Modifier l\'enseignant' : 'Ajouter un nouvel enseignant'}</DialogTitle>
        <DialogContent>
          <Box mt={2} display="flex" flexDirection="column" gap={2}>
            <TextField
              autoFocus
              margin="dense"
              name="name"
              label="Nom complet"
              fullWidth
              value={newTeacher.name}
              onChange={handleInputChange}
            />
            <TextField
              margin="dense"
              name="email"
              label="Email"
              type="email"
              fullWidth
              value={newTeacher.email}
              onChange={handleInputChange}
            />
            <TextField
              margin="dense"
              name="specialization"
              label="Spécialisation"
              fullWidth
              value={newTeacher.specialization}
              onChange={handleInputChange}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            Annuler
          </Button>
          <Button onClick={handleSaveTeacher} color="primary">
            {isEditing ? 'Mettre à jour' : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>

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