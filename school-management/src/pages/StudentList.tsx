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
  Snackbar,
  Alert,
  SelectChangeEvent,
  IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { studentDAO } from '../daos/StudentDAO';
import { IStudent } from '../database/SchoolDatabase';
import { Student } from '../models/Student';

// Définition des grades disponibles
const GRADES = ['6ème', '5ème', '4ème', '3ème', 'Seconde', 'Première', 'Terminale'];

export const StudentList = () => {
  const [students, setStudents] = useState<IStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newStudent, setNewStudent] = useState({
    id: undefined as number | undefined,
    name: '',
    email: '',
    grade: ''
  });
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  // Charger la liste des étudiants
  const loadStudents = async () => {
    try {
      setLoading(true);
      const data = await studentDAO.getAll();
      setStudents(data);
    } catch (error) {
      console.error('Erreur lors du chargement des étudiants:', error);
      showNotification('Erreur lors du chargement des étudiants', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  // Gérer l'ouverture du dialogue d'ajout d'étudiant
  const handleOpenDialog = () => {
    setIsEditing(false);
    setNewStudent({
      id: undefined,
      name: '',
      email: '',
      grade: ''
    });
    setOpenDialog(true);
  };

  // Gérer l'ouverture du dialogue de modification
  const handleOpenEditDialog = (student: IStudent) => {
    setIsEditing(true);
    setNewStudent({
      id: student.id,
      name: student.name,
      email: student.email,
      grade: student.grade
    });
    setOpenDialog(true);
  };

  // Gérer la fermeture du dialogue
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setIsEditing(false);
  };

  // Gérer les changements dans le formulaire
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = event.target;
    setNewStudent({
      ...newStudent,
      [name as string]: value
    });
  };

  // Gérer les changements dans le select
  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    setNewStudent({
      ...newStudent,
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

  // Supprimer un étudiant
  const handleDeleteStudent = async (id?: number) => {
    if (!id) return;
    
    try {
      if (window.confirm('Êtes-vous sûr de vouloir supprimer cet étudiant ?')) {
        await studentDAO.delete(id);
        showNotification('Étudiant supprimé avec succès', 'success');
        loadStudents();
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'étudiant:', error);
      showNotification('Erreur lors de la suppression de l\'étudiant', 'error');
    }
  };

  // Ajouter ou modifier un étudiant
  const handleSaveStudent = async () => {
    try {
      // Vérifier que tous les champs sont remplis
      if (!newStudent.name || !newStudent.email || !newStudent.grade) {
        showNotification('Veuillez remplir tous les champs', 'error');
        return;
      }

      // Vérifier le format de l'email
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(newStudent.email)) {
        showNotification('Format d\'email invalide', 'error');
        return;
      }

      // Créer un nouvel objet étudiant
      const studentData = {
        ...newStudent,
        createdAt: isEditing ? (await studentDAO.getById(newStudent.id!))?.createdAt || new Date() : new Date()
      };

      // Créer une instance du modèle
      const student = new Student(studentData);

      if (isEditing) {
        // Mettre à jour l'étudiant existant
        await studentDAO.update(newStudent.id!, student.toJSON());
        showNotification('Étudiant mis à jour avec succès', 'success');
      } else {
        // Ajouter à la base de données
        await studentDAO.add(student.toJSON());
        showNotification('Étudiant ajouté avec succès', 'success');
      }

      // Fermer le dialogue et recharger la liste
      handleCloseDialog();
      loadStudents();
    } catch (error) {
      console.error('Erreur lors de l\'opération sur l\'étudiant:', error);
      showNotification('Erreur lors de l\'opération sur l\'étudiant', 'error');
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Liste des Étudiants</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          Ajouter un étudiant
        </Button>
      </Box>

      {/* Tableau des étudiants */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nom</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Niveau</TableCell>
              <TableCell>Date d'ajout</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">Chargement...</TableCell>
              </TableRow>
            ) : students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">Aucun étudiant trouvé</TableCell>
              </TableRow>
            ) : (
              students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>{student.id}</TableCell>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell>{student.grade}</TableCell>
                  <TableCell>{new Date(student.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <IconButton 
                        color="primary" 
                        size="small" 
                        onClick={() => handleOpenEditDialog(student)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        color="error" 
                        size="small" 
                        onClick={() => handleDeleteStudent(student.id)}
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

      {/* Dialogue pour ajouter/modifier un étudiant */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditing ? 'Modifier l\'étudiant' : 'Ajouter un nouvel étudiant'}</DialogTitle>
        <DialogContent>
          <Box mt={2} display="flex" flexDirection="column" gap={2}>
            <TextField
              autoFocus
              margin="dense"
              name="name"
              label="Nom complet"
              fullWidth
              value={newStudent.name}
              onChange={handleInputChange}
            />
            <TextField
              margin="dense"
              name="email"
              label="Email"
              type="email"
              fullWidth
              value={newStudent.email}
              onChange={handleInputChange}
            />
            <FormControl fullWidth margin="dense">
              <InputLabel>Niveau</InputLabel>
              <Select
                name="grade"
                value={newStudent.grade}
                label="Niveau"
                onChange={handleSelectChange}
              >
                {GRADES.map((grade) => (
                  <MenuItem key={grade} value={grade}>
                    {grade}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            Annuler
          </Button>
          <Button onClick={handleSaveStudent} color="primary">
            {isEditing ? 'Mettre à jour' : 'Ajouter'}
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