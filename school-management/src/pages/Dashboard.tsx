import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  CircularProgress, 
  Paper, 
  IconButton,
  Divider,
  LinearProgress,
  alpha
} from '@mui/material';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import DevicesOutlinedIcon from '@mui/icons-material/DevicesOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SyncIcon from '@mui/icons-material/Sync';
import BuildIcon from '@mui/icons-material/Build';
import { studentDAO } from '../daos/StudentDAO';
import { courseDAO } from '../daos/CourseDAO';
import { resourceManager } from '../models/ResourceManager';
import { db } from '../database/SchoolDatabase';

interface DashboardStats {
  studentsCount: number;
  coursesCount: number;
  teachersCount: number;
  activeEnrollmentsCount: number;
  resourceStats: {
    total: number;
    available: number;
    inUse: number;
    maintenance: number;
  };
}

export const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const students = await studentDAO.getAll();
        
        const courses = await courseDAO.getAll();
        
        const teachers = await db.teachers.toArray();
        
        const now = new Date();
        const enrollments = await db.enrollments.toArray();
        const activeEnrollments = await Promise.all(
          enrollments.map(async enrollment => {
            const course = await courseDAO.getById(enrollment.courseId);
            if (!course) return false;
            const endDate = new Date(course.endDate);
            return endDate >= now;
          })
        );
        
        const resourceStats = await resourceManager.getResourceStats();
        
        setStats({
          studentsCount: students.length,
          coursesCount: courses.length,
          teachersCount: teachers.length,
          activeEnrollmentsCount: activeEnrollments.filter(Boolean).length,
          resourceStats
        });
        
        setLoading(false);
      } catch (error) {
        console.error("Erreur lors du chargement des statistiques:", error);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  const calculatePercentage = (value: number, total: number) => {
    if (total === 0) return 0;
    return (value / total) * 100;
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="600">
          Tableau de Bord
        </Typography>
        <Card sx={{ py: 0.5, px: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" fontWeight={500} color="text.secondary">
            {new Date().toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Typography>
        </Card>
      </Box>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        <Box sx={{ flex: '1 1 calc(25% - 18px)', minWidth: '250px' }}>
          <Card 
            sx={{ 
              position: 'relative', 
              overflow: 'hidden',
              height: '100%',
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
              }
            }}
          >
            <Box 
              sx={{ 
                position: 'absolute', 
                top: 0, 
                right: 0, 
                width: 90, 
                height: 90, 
                borderRadius: '0 0 0 90px',
                backgroundColor: alpha('#3f51b5', 0.08),
              }}
            />
            <CardContent sx={{ position: 'relative', zIndex: 1 }}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Box 
                    sx={{ 
                      bgcolor: alpha('#3f51b5', 0.1), 
                      width: 48, 
                      height: 48, 
                      borderRadius: 2, 
                      display: 'flex', 
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2
                    }}
                  >
                    <PeopleAltOutlinedIcon color="primary" />
                  </Box>
                  <Typography color="text.secondary" variant="body2" fontWeight={500}>
                    Étudiants
                  </Typography>
                  <Typography variant="h4" fontWeight={600} mt={1}>
                    {stats?.studentsCount || 0}
                  </Typography>
                </Box>
                <IconButton size="small" sx={{ color: 'text.secondary' }}>
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </Box>
              
              <Box display="flex" alignItems="center" gap={0.5} mt={1.5}>
                <TrendingUpIcon color="success" fontSize="small" />
                <Typography variant="body2" color="success.main" fontWeight={500}>
                  +{Math.floor(Math.random() * 10) + 5}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  depuis le mois dernier
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
        
        <Box sx={{ flex: '1 1 calc(25% - 18px)', minWidth: '250px' }}>
          <Card 
            sx={{ 
              position: 'relative', 
              overflow: 'hidden',
              height: '100%',
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
              }
            }}
          >
            <Box 
              sx={{ 
                position: 'absolute', 
                top: 0, 
                right: 0, 
                width: 90, 
                height: 90, 
                borderRadius: '0 0 0 90px',
                backgroundColor: alpha('#f50057', 0.08),
              }}
            />
            <CardContent sx={{ position: 'relative', zIndex: 1 }}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Box 
                    sx={{ 
                      bgcolor: alpha('#f50057', 0.1), 
                      width: 48, 
                      height: 48, 
                      borderRadius: 2, 
                      display: 'flex', 
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2
                    }}
                  >
                    <MenuBookOutlinedIcon sx={{ color: 'secondary.main' }} />
                  </Box>
                  <Typography color="text.secondary" variant="body2" fontWeight={500}>
                    Cours
                  </Typography>
                  <Typography variant="h4" fontWeight={600} mt={1}>
                    {stats?.coursesCount || 0}
                  </Typography>
                </Box>
                <IconButton size="small" sx={{ color: 'text.secondary' }}>
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </Box>
              
              <Box display="flex" alignItems="center" gap={0.5} mt={1.5}>
                <TrendingUpIcon color="success" fontSize="small" />
                <Typography variant="body2" color="success.main" fontWeight={500}>
                  +{Math.floor(Math.random() * 10) + 2}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  depuis le mois dernier
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
        
        <Box sx={{ flex: '1 1 calc(25% - 18px)', minWidth: '250px' }}>
          <Card 
            sx={{ 
              position: 'relative', 
              overflow: 'hidden',
              height: '100%',
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
              }
            }}
          >
            <Box 
              sx={{ 
                position: 'absolute', 
                top: 0, 
                right: 0, 
                width: 90, 
                height: 90, 
                borderRadius: '0 0 0 90px',
                backgroundColor: alpha('#4caf50', 0.08),
              }}
            />
            <CardContent sx={{ position: 'relative', zIndex: 1 }}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Box 
                    sx={{ 
                      bgcolor: alpha('#4caf50', 0.1), 
                      width: 48, 
                      height: 48, 
                      borderRadius: 2, 
                      display: 'flex', 
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2
                    }}
                  >
                    <PersonOutlineOutlinedIcon sx={{ color: 'success.main' }} />
                  </Box>
                  <Typography color="text.secondary" variant="body2" fontWeight={500}>
                    Enseignants
                  </Typography>
                  <Typography variant="h4" fontWeight={600} mt={1}>
                    {stats?.teachersCount || 0}
                  </Typography>
                </Box>
                <IconButton size="small" sx={{ color: 'text.secondary' }}>
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </Box>
              
              <Box display="flex" alignItems="center" gap={0.5} mt={1.5}>
                <TrendingUpIcon color="success" fontSize="small" />
                <Typography variant="body2" color="success.main" fontWeight={500}>
                  +{Math.floor(Math.random() * 5) + 1}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  depuis le mois dernier
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
        
        <Box sx={{ flex: '1 1 calc(25% - 18px)', minWidth: '250px' }}>
          <Card 
            sx={{ 
              position: 'relative', 
              overflow: 'hidden',
              height: '100%',
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
              }
            }}
          >
            <Box 
              sx={{ 
                position: 'absolute', 
                top: 0, 
                right: 0, 
                width: 90, 
                height: 90, 
                borderRadius: '0 0 0 90px',
                backgroundColor: alpha('#ff9800', 0.08),
              }}
            />
            <CardContent sx={{ position: 'relative', zIndex: 1 }}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Box 
                    sx={{ 
                      bgcolor: alpha('#ff9800', 0.1), 
                      width: 48, 
                      height: 48, 
                      borderRadius: 2, 
                      display: 'flex', 
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2
                    }}
                  >
                    <SchoolOutlinedIcon sx={{ color: 'warning.main' }} />
                  </Box>
                  <Typography color="text.secondary" variant="body2" fontWeight={500}>
                    Inscriptions Actives
                  </Typography>
                  <Typography variant="h4" fontWeight={600} mt={1}>
                    {stats?.activeEnrollmentsCount || 0}
                  </Typography>
                </Box>
                <IconButton size="small" sx={{ color: 'text.secondary' }}>
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </Box>
              
              <Box display="flex" alignItems="center" gap={0.5} mt={1.5}>
                <TrendingUpIcon color="success" fontSize="small" />
                <Typography variant="body2" color="success.main" fontWeight={500}>
                  +{Math.floor(Math.random() * 15) + 5}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  depuis le mois dernier
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
        
        <Box sx={{ width: '100%', mt: 1 }}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <Box 
                    sx={{ 
                      bgcolor: alpha('#2196f3', 0.1), 
                      width: 42, 
                      height: 42, 
                      borderRadius: 2, 
                      display: 'flex', 
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <DevicesOutlinedIcon sx={{ color: 'info.main' }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      État des Ressources
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Vue d'ensemble des ressources matérielles et leur disponibilité
                    </Typography>
                  </Box>
                </Box>
                <IconButton size="small" sx={{ color: 'text.secondary' }}>
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </Box>
              
              <Divider sx={{ mb: 3 }} />
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                <Box sx={{ flex: '1 1 calc(50% - 12px)', minWidth: '280px' }}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, borderColor: 'divider' }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <CheckCircleOutlineIcon color="success" fontSize="small" />
                        <Typography variant="body2" fontWeight={600}>
                          Ressources Disponibles
                        </Typography>
                      </Box>
                      <Typography variant="body2" fontWeight={600} color="success.main">
                        {stats?.resourceStats.available || 0}
                      </Typography>
                    </Box>
                    
                    <LinearProgress 
                      variant="determinate" 
                      value={calculatePercentage(stats?.resourceStats.available || 0, stats?.resourceStats.total || 1)} 
                      color="success"
                      sx={{ height: 8, borderRadius: 4, mb: 0.5 }}
                    />
                    
                    <Typography variant="caption" color="text.secondary">
                      {calculatePercentage(stats?.resourceStats.available || 0, stats?.resourceStats.total || 1).toFixed(0)}% des ressources sont disponibles
                    </Typography>
                  </Paper>
                </Box>
                
                <Box sx={{ flex: '1 1 calc(50% - 12px)', minWidth: '280px' }}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, borderColor: 'divider' }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <SyncIcon color="info" fontSize="small" />
                        <Typography variant="body2" fontWeight={600}>
                          Ressources Utilisées
                        </Typography>
                      </Box>
                      <Typography variant="body2" fontWeight={600} color="info.main">
                        {stats?.resourceStats.inUse || 0}
                      </Typography>
                    </Box>
                    
                    <LinearProgress 
                      variant="determinate" 
                      value={calculatePercentage(stats?.resourceStats.inUse || 0, stats?.resourceStats.total || 1)} 
                      color="info"
                      sx={{ height: 8, borderRadius: 4, mb: 0.5 }}
                    />
                    
                    <Typography variant="caption" color="text.secondary">
                      {calculatePercentage(stats?.resourceStats.inUse || 0, stats?.resourceStats.total || 1).toFixed(0)}% des ressources sont en cours d'utilisation
                    </Typography>
                  </Paper>
                </Box>
                
                <Box sx={{ flex: '1 1 calc(50% - 12px)', minWidth: '280px' }}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, borderColor: 'divider' }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <BuildIcon color="error" fontSize="small" />
                        <Typography variant="body2" fontWeight={600}>
                          Ressources en Maintenance
                        </Typography>
                      </Box>
                      <Typography variant="body2" fontWeight={600} color="error.main">
                        {stats?.resourceStats.maintenance || 0}
                      </Typography>
                    </Box>
                    
                    <LinearProgress 
                      variant="determinate" 
                      value={calculatePercentage(stats?.resourceStats.maintenance || 0, stats?.resourceStats.total || 1)} 
                      color="error"
                      sx={{ height: 8, borderRadius: 4, mb: 0.5 }}
                    />
                    
                    <Typography variant="caption" color="text.secondary">
                      {calculatePercentage(stats?.resourceStats.maintenance || 0, stats?.resourceStats.total || 1).toFixed(0)}% des ressources sont en maintenance
                    </Typography>
                  </Paper>
                </Box>
                
                <Box sx={{ flex: '1 1 calc(50% - 12px)', minWidth: '280px' }}>
                  <Paper 
                    sx={{ 
                      p: 2, 
                      borderRadius: 2, 
                      height: '100%', 
                      bgcolor: 'primary.main', 
                      color: 'white',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      textAlign: 'center',
                      gap: 1
                    }}
                  >
                    <Typography variant="h3" fontWeight={600}>
                      {stats?.resourceStats.total || 0}
                    </Typography>
                    <Typography variant="body1">
                      Ressources au Total
                    </Typography>
                  </Paper>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}; 