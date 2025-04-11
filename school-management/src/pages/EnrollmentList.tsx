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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Snackbar,
  Alert,
  SelectChangeEvent
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { enrollmentService } from '../services/EnrollmentService';
import { db, IEnrollment, IStudent, ICourse } from '../database/SchoolDatabase';
import { studentDAO } from '../daos/StudentDAO';
import { courseDAO } from '../daos/CourseDAO';

interface EnrollmentWithDetails extends IEnrollment {
  studentName?: string;
  courseName?: string;
}

export const EnrollmentList = () => {
  const [enrollments, setEnrollments] = useState<EnrollmentWithDetails[]>([]);
  const [students, setStudents] = useState<IStudent[]>([]);
  const [courses, setCourses] = useState<ICourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [newEnrollment, setNewEnrollment] = useState({
    studentId: '',
    courseId: '',
  });
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  // Charger les données
  const loadData = async () => {
    try {
      setLoading(true);
      
      // Charger les inscriptions, étudiants et cours
      const enrollmentsData = await db.enrollments.toArray();
      const studentsData = await studentDAO.getAll();
      const coursesData = await courseDAO.getAll();
      
      // Ajouter les informations des étudiants et des cours aux inscriptions
      const enrollmentsWithDetails = await Promise.all(
        enrollmentsData.map(async (enrollment) => {
          const student = studentsData.find(s => s.id === enrollment.studentId);
          const course = coursesData.find(c => c.id === enrollment.courseId);
          
          return {
            ...enrollment,
            studentName: student?.name,
            courseName: course?.name
          };
        })
      );
      
      setEnrollments(enrollmentsWithDetails);
      setStudents(studentsData);
      setCourses(coursesData);
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

  // Gérer l'ouverture du dialogue d'ajout d'inscription
  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  // Gérer la fermeture du dialogue
  const handleCloseDialog = () => {
    setOpenDialog(false);
    // Réinitialiser le formulaire
    setNewEnrollment({
      studentId: '',
      courseId: '',
    });
  };

  // Gérer les changements dans le select
  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    setNewEnrollment({
      ...newEnrollment,
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

  // Ajouter une nouvelle inscription
  const handleAddEnrollment = async () => {
    try {
      // Vérifier que tous les champs sont remplis
      if (!newEnrollment.studentId || !newEnrollment.courseId) {
        showNotification('Veuillez sélectionner un étudiant et un cours', 'error');
        return;
      }

      // Inscrire l'étudiant au cours
      const result = await enrollmentService.enrollStudent(
        parseInt(newEnrollment.studentId),
        parseInt(newEnrollment.courseId)
      );

      if (result.success) {
        // Fermer le dialogue et recharger la liste
        handleCloseDialog();
        showNotification('Inscription créée avec succès', 'success');
        loadData();
      } else {
        showNotification(result.message, 'error');
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'inscription:', error);
      showNotification('Erreur lors de l\'ajout de l\'inscription', 'error');
    }
  };

  // Désinscrire un étudiant
  const handleUnenroll = async (studentId: number, courseId: number) => {
    try {
      const result = await enrollmentService.unenrollStudent(studentId, courseId);
      
      if (result.success) {
        showNotification('Désinscription réussie', 'success');
        loadData();
      } else {
        showNotification(result.message, 'error');
      }
    } catch (error) {
      console.error('Erreur lors de la désinscription:', error);
      showNotification('Erreur lors de la désinscription', 'error');
    }
  };

  // Attribuer une note
  const handleAssignGrade = async (enrollment: EnrollmentWithDetails) => {
    try {
      const grade = prompt(`Entrez la note pour ${enrollment.studentName} au cours ${enrollment.courseName} (entre 0 et 20):`);
      
      if (grade === null) return; // L'utilisateur a annulé
      
      const gradeValue = parseFloat(grade);
      
      if (isNaN(gradeValue) || gradeValue < 0 || gradeValue > 20) {
        showNotification('Veuillez entrer une note valide entre 0 et 20', 'error');
        return;
      }
      
      const result = await enrollmentService.assignGrade(
        enrollment.studentId,
        enrollment.courseId,
        gradeValue
      );
      
      if (result.success) {
        showNotification('Note attribuée avec succès', 'success');
        loadData();
      } else {
        showNotification(result.message, 'error');
      }
    } catch (error) {
      console.error('Erreur lors de l\'attribution de la note:', error);
      showNotification('Erreur lors de l\'attribution de la note', 'error');
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Liste des Inscriptions</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          Nouvelle inscription
        </Button>
      </Box>

      {/* Tableau des inscriptions */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Étudiant</TableCell>
              <TableCell>Cours</TableCell>
              <TableCell>Date d'inscription</TableCell>
              <TableCell>Note</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">Chargement...</TableCell>
              </TableRow>
            ) : enrollments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">Aucune inscription trouvée</TableCell>
              </TableRow>
            ) : (
              enrollments.map((enrollment) => (
                <TableRow key={enrollment.id}>
                  <TableCell>{enrollment.id}</TableCell>
                  <TableCell>{enrollment.studentName || `Étudiant #${enrollment.studentId}`}</TableCell>
                  <TableCell>{enrollment.courseName || `Cours #${enrollment.courseId}`}</TableCell>
                  <TableCell>{new Date(enrollment.enrollmentDate).toLocaleDateString()}</TableCell>
                  <TableCell>{enrollment.grade !== undefined ? enrollment.grade : 'Non noté'}</TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <Button 
                        size="small" 
                        variant="outlined" 
                        color="primary"
                        onClick={() => handleAssignGrade(enrollment)}
                      >
                        Noter
                      </Button>
                      <Button 
                        size="small" 
                        variant="outlined" 
                        color="error"
                        onClick={() => handleUnenroll(enrollment.studentId, enrollment.courseId)}
                      >
                        Désinscrire
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialogue pour ajouter une inscription */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Ajouter une nouvelle inscription</DialogTitle>
        <DialogContent>
          <Box mt={2} display="flex" flexDirection="column" gap={2}>
            <FormControl fullWidth margin="dense">
              <InputLabel>Étudiant</InputLabel>
              <Select
                name="studentId"
                value={newEnrollment.studentId}
                label="Étudiant"
                onChange={handleSelectChange}
              >
                {students.map((student) => (
                  <MenuItem key={student.id} value={student.id?.toString()}>
                    {student.name} - {student.grade}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="dense">
              <InputLabel>Cours</InputLabel>
              <Select
                name="courseId"
                value={newEnrollment.courseId}
                label="Cours"
                onChange={handleSelectChange}
              >
                {courses.map((course) => (
                  <MenuItem key={course.id} value={course.id?.toString()}>
                    {course.name} - {new Date(course.startDate).toLocaleDateString()} au {new Date(course.endDate).toLocaleDateString()}
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
          <Button onClick={handleAddEnrollment} color="primary">
            Inscrire
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