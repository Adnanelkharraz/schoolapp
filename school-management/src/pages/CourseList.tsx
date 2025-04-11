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
import { courseDAO } from '../daos/CourseDAO';
import { teacherDAO } from '../daos/TeacherDAO';
import { ICourse, ITeacher } from '../database/SchoolDatabase';
import { CourseFactory } from '../models/Course';

// Définition des types de cours disponibles
const COURSE_TYPES = ['math', 'science', 'history', 'french', 'english', 'spanish'];

export const CourseList = () => {
  const [courses, setCourses] = useState<ICourse[]>([]);
  const [teachers, setTeachers] = useState<ITeacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newCourse, setNewCourse] = useState({
    id: undefined as number | undefined,
    name: '',
    description: '',
    courseType: '',
    teacherId: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0]
  });
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  // Charger la liste des cours et des enseignants
  const loadData = async () => {
    try {
      setLoading(true);
      const coursesData = await courseDAO.getAll();
      const teachersData = await teacherDAO.getAll();
      
      // Convertir les dates en objets Date
      const formattedCourses = coursesData.map(course => ({
        ...course,
        startDate: new Date(course.startDate),
        endDate: new Date(course.endDate)
      }));
      
      setCourses(formattedCourses);
      setTeachers(teachersData);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      showNotification('Erreur lors du chargement des données', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Gérer l'ouverture du dialogue d'ajout de cours
  const handleOpenDialog = () => {
    setIsEditing(false);
    setNewCourse({
      id: undefined,
      name: '',
      description: '',
      courseType: '',
      teacherId: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0]
    });
    setOpenDialog(true);
  };

  // Gérer l'ouverture du dialogue de modification
  const handleOpenEditDialog = (course: ICourse) => {
    setIsEditing(true);
    setNewCourse({
      id: course.id,
      name: course.name,
      description: course.description,
      courseType: course.courseType,
      teacherId: course.teacherId.toString(),
      startDate: new Date(course.startDate).toISOString().split('T')[0],
      endDate: new Date(course.endDate).toISOString().split('T')[0]
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
    setNewCourse({
      ...newCourse,
      [name as string]: value
    });
  };

  // Gérer les changements dans le select
  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    setNewCourse({
      ...newCourse,
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

  // Trouver le nom de l'enseignant par ID
  const getTeacherName = (teacherId: number): string => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? teacher.name : 'Inconnu';
  };

  // Supprimer un cours
  const handleDeleteCourse = async (id?: number) => {
    if (!id) return;
    
    try {
      if (window.confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) {
        await courseDAO.delete(id);
        showNotification('Cours supprimé avec succès', 'success');
        loadData();
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du cours:', error);
      showNotification('Erreur lors de la suppression du cours', 'error');
    }
  };

  // Ajouter ou modifier un cours
  const handleSaveCourse = async () => {
    try {
      // Vérifier que tous les champs sont remplis
      if (!newCourse.name || !newCourse.description || !newCourse.courseType || !newCourse.teacherId || !newCourse.startDate || !newCourse.endDate) {
        showNotification('Veuillez remplir tous les champs', 'error');
        return;
      }

      // Convertir les dates
      const startDate = new Date(newCourse.startDate);
      const endDate = new Date(newCourse.endDate);
      
      // Vérifier que la date de fin est après la date de début
      if (endDate <= startDate) {
        showNotification('La date de fin doit être postérieure à la date de début', 'error');
        return;
      }

      // Créer un nouvel objet cours avec la factory
      const course = CourseFactory.createCourse(newCourse.courseType, {
        id: newCourse.id,
        name: newCourse.name,
        description: newCourse.description,
        startDate,
        endDate,
        teacherId: parseInt(newCourse.teacherId)
      });

      if (isEditing) {
        // Mettre à jour un cours existant
        await courseDAO.update(newCourse.id!, course.toJSON());
        showNotification('Cours mis à jour avec succès', 'success');
      } else {
        // Ajouter un nouveau cours
        await courseDAO.add(course.toJSON());
        showNotification('Cours ajouté avec succès', 'success');
      }

      // Fermer le dialogue et recharger la liste
      handleCloseDialog();
      loadData();
    } catch (error) {
      console.error('Erreur lors de l\'opération sur le cours:', error);
      showNotification('Erreur lors de l\'opération sur le cours', 'error');
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Liste des Cours</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          Ajouter un cours
        </Button>
      </Box>

      {/* Tableau des cours */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nom</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Enseignant</TableCell>
              <TableCell>Date de début</TableCell>
              <TableCell>Date de fin</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center">Chargement...</TableCell>
              </TableRow>
            ) : courses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">Aucun cours trouvé</TableCell>
              </TableRow>
            ) : (
              courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell>{course.id}</TableCell>
                  <TableCell>{course.name}</TableCell>
                  <TableCell>{course.description}</TableCell>
                  <TableCell>{course.courseType}</TableCell>
                  <TableCell>{getTeacherName(course.teacherId)}</TableCell>
                  <TableCell>{course.startDate.toLocaleDateString()}</TableCell>
                  <TableCell>{course.endDate.toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <IconButton 
                        color="primary" 
                        size="small" 
                        onClick={() => handleOpenEditDialog(course)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        color="error" 
                        size="small" 
                        onClick={() => handleDeleteCourse(course.id)}
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

      {/* Dialogue pour ajouter/modifier un cours */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditing ? 'Modifier le cours' : 'Ajouter un nouveau cours'}</DialogTitle>
        <DialogContent>
          <Box mt={2} display="flex" flexDirection="column" gap={2}>
            <TextField
              autoFocus
              margin="dense"
              name="name"
              label="Nom du cours"
              fullWidth
              value={newCourse.name}
              onChange={handleInputChange}
            />
            <TextField
              margin="dense"
              name="description"
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={newCourse.description}
              onChange={handleInputChange}
            />
            <FormControl fullWidth margin="dense">
              <InputLabel>Type de cours</InputLabel>
              <Select
                name="courseType"
                value={newCourse.courseType}
                label="Type de cours"
                onChange={handleSelectChange}
              >
                {COURSE_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="dense">
              <InputLabel>Enseignant</InputLabel>
              <Select
                name="teacherId"
                value={newCourse.teacherId}
                label="Enseignant"
                onChange={handleSelectChange}
              >
                {teachers.map((teacher) => (
                  <MenuItem key={teacher.id} value={teacher.id?.toString()}>
                    {teacher.name} - {teacher.specialization}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box display="flex" gap={2}>
              <TextField
                margin="dense"
                name="startDate"
                label="Date de début"
                type="date"
                value={newCourse.startDate}
                onChange={handleInputChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                margin="dense"
                name="endDate"
                label="Date de fin"
                type="date"
                value={newCourse.endDate}
                onChange={handleInputChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            Annuler
          </Button>
          <Button onClick={handleSaveCourse} color="primary">
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