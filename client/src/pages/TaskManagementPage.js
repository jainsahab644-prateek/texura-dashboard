// TaskManagementPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, Paper, Typography, Container, Grid, TextField, Button, Select, MenuItem, 
  FormControl, InputLabel, Tabs, Tab,  Chip, Tooltip, Dialog, DialogTitle, 
  DialogContent, DialogActions, IconButton, Snackbar, Alert, Skeleton, useMediaQuery,
  ThemeProvider, createTheme, Stack
} from '@mui/material';
import { green, orange, red ,  grey } from '@mui/material/colors';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import RemoveIcon from '@mui/icons-material/Remove';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import InboxIcon from '@mui/icons-material/Inbox';

import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import '../App.css'; // keep your animations + add styles below if needed

// Theme - tweak colors/font here
const theme = createTheme({
  palette: {
    primary: { main: '#00A884' },
    background: { default: '#f7f9fb', paper: '#fff' },
  },
  typography: {
    fontFamily: '"Inter", "Poppins", "Roboto", sans-serif',
    h4: { fontWeight: 700 },
    h6: { fontWeight: 600 }
  }
});

// small skeleton card
const TaskSkeleton = () => (
  <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
    <Skeleton variant="text" width="60%" />
    <Skeleton variant="rectangular" height={60} sx={{ mt: 1 }} />
  </Paper>
);

const EmptyState = ({ message, onCreate }) => (
  <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
    <InboxIcon sx={{ fontSize: 48, color: 'grey.400' }} />
    <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>{message}</Typography>
    {onCreate && <Button startIcon={<AddIcon />} sx={{ mt: 2 }} variant="outlined" onClick={onCreate}>Create Task</Button>}
  </Paper>
);

const statusOrder = ['To Do', 'In Progress', 'Completed'];

const TaskManagementPage = () => {
  const isSm = useMediaQuery(theme.breakpoints.down('md'));
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({ title: '', description: '', priority: 'Medium', assignee: '', dueDate: '' });
  const [controlsTab, setControlsTab] = useState(0); // 0 = Create, 1 = Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  // Fetch tasks & users
  const fetchTasksAndUsers = async () => {
    setLoading(true);
    try {
      const [tasksRes, usersRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/api/tasks`),
        axios.get(`${process.env.REACT_APP_API_URL}/api/users`)
      ]);
      setTasks(tasksRes.data || []);
      setUsers((usersRes.data || []).filter(u => u.role === 'employee'));
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to fetch data.', severity: 'error' });
    }
    setLoading(false);
  };

  useEffect(() => { fetchTasksAndUsers(); }, []);

  const handleSnackbarClose = (event, reason) => { if (reason === 'clickaway') return; setSnackbar({ ...snackbar, open: false }); };
  const handleFormChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // CREATE
  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/tasks`, formData);
      await fetchTasksAndUsers();
      setSnackbar({ open: true, message: 'Task created!', severity: 'success' });
      setFormData({ title: '', description: '', priority: 'Medium', assignee: '', dueDate: '' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to create task.', severity: 'error' });
    }
  };

  // OPEN EDIT DIALOG
  const openEdit = (task) => { setCurrentTask({ ...task }); setEditDialogOpen(true); };
  const closeEdit = () => { setEditDialogOpen(false); setCurrentTask(null); };

  // UPDATE
  const handleUpdateTask = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`${process.env.REACT_APP_API_URL}/api/tasks/${currentTask._id}`, currentTask);
      setTasks(tasks.map(t => (t._id === currentTask._1 ? res.data : t)));
      await fetchTasksAndUsers();
      setSnackbar({ open: true, message: 'Task updated!', severity: 'success' });
      closeEdit();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to update task.', severity: 'error' });
    }
  };

  // DELETE (with dialog)
  const confirmDelete = (taskId) => { setDeleteTargetId(taskId); setDeleteDialogOpen(true); };
  const performDelete = async () => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/tasks/${deleteTargetId}`);
      setTasks(tasks.filter(t => t._id !== deleteTargetId));
      setSnackbar({ open: true, message: 'Task deleted.', severity: 'info' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to delete task.', severity: 'error' });
    }
    setDeleteDialogOpen(false);
    setDeleteTargetId(null);
  };

  // Filtering logic
  const filteredTasks = tasks
    .filter(t => t.title?.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(t => statusFilter ? t.status === statusFilter : true)
    .filter(t => assigneeFilter ? (t.assignee?._id === assigneeFilter) : true);

  // Group tasks by status in the order
  const grouped = statusOrder.reduce((acc, status) => ({ ...acc, [status]: filteredTasks.filter(t => t.status === status) }), {});

  const getPriorityProps = (priority) => {
    switch (priority) {
      case 'High': return { icon: <ArrowUpwardIcon />, color: 'error', leftColor: red[500] };
      case 'Medium': return { icon: <RemoveIcon />, color: 'warning', leftColor: orange[500] };
      case 'Low': return { icon: <ArrowDownwardIcon />, color: 'success', leftColor: green[600] };
      default: return { icon: <RemoveIcon />, color: 'default', leftColor: grey[500] };
    }
  };

  // Drag & Drop handler (update status on drop)
  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    // if dropped in same place and same index -> nothing
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    // update local order/state (simple approach)

    const destStatus = destination.droppableId;
    // find task
    const task = tasks.find(t => t._id === draggableId);
    if (!task) return;

    const updatedTask = { ...task, status: destStatus };
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/tasks/${task._id}`, updatedTask);
      await fetchTasksAndUsers();
      setSnackbar({ open: true, message: `Moved to "${destStatus}"`, severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to move task.', severity: 'error' });
    }
  };

  // Responsive column style
  const columnStyle = {
    p: 2, borderRadius: 2, backgroundColor: '#f4f6f8', height: isSm ? 'auto' : '70vh', display: 'flex', flexDirection: 'column'
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Typography variant="h4" gutterBottom>Task Management</Typography>

        {/* Controls: Tabs for Create / Filter */}
        <Paper sx={{ mb: 3, p: 2, borderRadius: 2 }}>
          <Tabs value={controlsTab} onChange={(e, v) => setControlsTab(v)} textColor="primary" indicatorColor="primary">
            <Tab label="Create Task" icon={<AddIcon />} />
            <Tab label="Filter Tasks" icon={<SearchIcon />} />
          </Tabs>
          <Box sx={{ mt: 2 }}>
            {controlsTab === 0 && (
              <Box component="form" onSubmit={onSubmit}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={4}><TextField fullWidth required label="Task Title" name="title" value={formData.title} onChange={handleFormChange} variant="outlined" size="small" /></Grid>
                  <Grid item xs={12} md={4}><TextField fullWidth label="Description" name="description" value={formData.description} onChange={handleFormChange} variant="outlined" size="small" /></Grid>
                  <Grid item xs={12} md={2}><FormControl fullWidth size="small"><InputLabel>Priority</InputLabel><Select name="priority" value={formData.priority} label="Priority" onChange={handleFormChange}><MenuItem value="Low">Low</MenuItem><MenuItem value="Medium">Medium</MenuItem><MenuItem value="High">High</MenuItem></Select></FormControl></Grid>
                  <Grid item xs={12} md={2} sx={{ display: 'flex', gap: 1 }}>
                    <Button type="submit" variant="contained" startIcon={<AddIcon />}>Create</Button>
                    <Button variant="outlined" onClick={() => setFormData({ title: '', description: '', priority: 'Medium', assignee: '', dueDate: '' })}>Reset</Button>
                  </Grid>
                  <Grid item xs={12} md={3}><FormControl fullWidth size="small"><InputLabel>Assign to</InputLabel><Select name="assignee" value={formData.assignee} label="Assign to" onChange={handleFormChange}><MenuItem value=""><em>Unassigned</em></MenuItem>{users.map(u => <MenuItem key={u._id} value={u._id}>{u.fullName}</MenuItem>)}</Select></FormControl></Grid>
                  <Grid item xs={12} md={3}><TextField name="dueDate" label="Due Date" type="date" value={formData.dueDate} onChange={handleFormChange} fullWidth size="small" InputLabelProps={{ shrink: true }} /></Grid>
                </Grid>
              </Box>
            )}
            {controlsTab === 1 && (
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={4}><TextField fullWidth variant="outlined" size="small" placeholder="Search by title..." InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1 }} /> }} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></Grid>
                <Grid item xs={12} md={3}><FormControl fullWidth size="small"><InputLabel>Filter by Status</InputLabel><Select value={statusFilter} label="Filter by Status" onChange={(e) => setStatusFilter(e.target.value)}><MenuItem value=""><em>All</em></MenuItem>{statusOrder.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}</Select></FormControl></Grid>
                <Grid item xs={12} md={3}><FormControl fullWidth size="small"><InputLabel>Filter by Employee</InputLabel><Select value={assigneeFilter} label="Filter by Employee" onChange={(e) => setAssigneeFilter(e.target.value)}><MenuItem value=""><em>All</em></MenuItem>{users.map(u => <MenuItem key={u._id} value={u._id}>{u.fullName}</MenuItem>)}</Select></FormControl></Grid>
                <Grid item xs={12} md={2}><Button variant="outlined" onClick={() => { setSearchTerm(''); setStatusFilter(''); setAssigneeFilter(''); }}>Clear</Button></Grid>
              </Grid>
            )}
          </Box>
        </Paper>

        {/* Kanban Columns with Drag & Drop */}
        <DragDropContext onDragEnd={onDragEnd}>
          <Grid container spacing={2}>
            {statusOrder.map((status) => (
              <Grid item xs={12} md={4} key={status}>
                <Paper sx={columnStyle}>
                  <Box sx={{ position: 'sticky', top: 8, zIndex: 2, background: 'transparent', mb: 1 }}>
                    <Typography variant="h6">{status} ({grouped[status]?.length || 0})</Typography>
                  </Box>

                  <Droppable droppableId={status}>
                    {(provided, snapshot) => (
                      <Box
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        sx={{
                          flex: 1,
                          overflowY: 'auto',
                          pr: 1,
                          pt: 1,
                          // nicer drop background
                          borderRadius: 1,
                          '&:hover': { backgroundColor: snapshot.isDraggingOver ? 'rgba(0,168,132,0.04)' : 'transparent' }
                        }}
                      >
                        {loading ? (
                          <>
                            <TaskSkeleton />
                            <TaskSkeleton />
                          </>
                        ) : (grouped[status]?.length > 0 ? (
                          grouped[status].map((task, index) => {
                            const priorityProps = getPriorityProps(task.priority);
                            const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Completed';
                            return (
                              <Draggable key={task._id} draggableId={task._id} index={index}>
                                {(dragProvided, dragSnapshot) => (
                                  <Paper
                                    ref={dragProvided.innerRef}
                                    {...dragProvided.draggableProps}
                                    {...dragProvided.dragHandleProps}
                                    elevation={dragSnapshot.isDragging ? 8 : 2}
                                    sx={{
                                      p: 2, mb: 2, borderRadius: 2, position: 'relative',
                                      transition: 'transform 150ms ease, box-shadow 150ms ease',
                                      transform: dragSnapshot.isDragging ? 'scale(1.02)' : 'none',
                                      borderLeft: `6px solid ${priorityProps.leftColor}`,
                                      backgroundColor: '#fff'
                                    }}
                                  >
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                      <Box sx={{ maxWidth: '70%' }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{task.title}</Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{task.description || 'No Description'}</Typography>
                                      </Box>
                                      <Stack direction="row" spacing={0.5} alignItems="center">
                                        <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(task)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                                        <Tooltip title="Delete"><IconButton size="small" onClick={() => confirmDelete(task._id)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                                      </Stack>
                                    </Box>

                                    <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                      <Chip icon={priorityProps.icon} label={task.priority} size="small" variant="outlined" />
                                      <Box sx={{ textAlign: 'right' }}>
                                        {task.dueDate && <Typography variant="caption" sx={{ display: 'block', color: isOverdue ? 'error.main' : 'text.secondary', fontWeight: isOverdue ? 700 : 400 }}>Due: {new Date(task.dueDate).toLocaleDateString()}</Typography>}
                                        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>{task.assignee ? task.assignee.fullName : 'Unassigned'}</Typography>
                                      </Box>
                                    </Box>
                                  </Paper>
                                )}
                              </Draggable>
                            );
                          })
                        ) : (
                          <EmptyState message={`No tasks in "${status}".`} onCreate={() => setControlsTab(0)} />
                        ))}
                        {provided.placeholder}
                      </Box>
                    )}
                  </Droppable>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </DragDropContext>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onClose={closeEdit} fullWidth maxWidth="sm">
          <DialogTitle>
            Edit Task
            <IconButton aria-label="close" onClick={closeEdit} sx={{ position: 'absolute', right: 8, top: 8 }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <Box component="form" onSubmit={handleUpdateTask} sx={{ display: 'grid', gap: 2 }}>
              <TextField label="Title" value={currentTask?.title || ''} onChange={(e) => setCurrentTask({ ...currentTask, title: e.target.value })} fullWidth />
              <TextField label="Description" value={currentTask?.description || ''} onChange={(e) => setCurrentTask({ ...currentTask, description: e.target.value })} fullWidth multiline rows={3} />
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth size="small"><InputLabel>Priority</InputLabel><Select value={currentTask?.priority || 'Medium'} label="Priority" onChange={(e) => setCurrentTask({ ...currentTask, priority: e.target.value })}><MenuItem value="Low">Low</MenuItem><MenuItem value="Medium">Medium</MenuItem><MenuItem value="High">High</MenuItem></Select></FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth size="small"><InputLabel>Status</InputLabel><Select value={currentTask?.status || 'To Do'} label="Status" onChange={(e) => setCurrentTask({ ...currentTask, status: e.target.value })}>{statusOrder.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}</Select></FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth size="small"><InputLabel>Assignee</InputLabel><Select value={currentTask?.assignee?._id || ''} label="Assignee" onChange={(e) => {
                    const selected = users.find(u => u._id === e.target.value) || null;
                    setCurrentTask({ ...currentTask, assignee: selected });
                  }}>
                    <MenuItem value=""><em>Unassigned</em></MenuItem>
                    {users.map(u => <MenuItem key={u._id} value={u._id}>{u.fullName}</MenuItem>)}
                  </Select></FormControl>
                </Grid>
              </Grid>
              <TextField label="Due Date" type="date" value={currentTask?.dueDate ? currentTask.dueDate.split('T')[0] : ''} InputLabelProps={{ shrink: true }} onChange={(e) => setCurrentTask({ ...currentTask, dueDate: e.target.value })} size="small" fullWidth />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeEdit}>Cancel</Button>
            <Button variant="contained" onClick={handleUpdateTask}>Save</Button>
          </DialogActions>
        </Dialog>

        {/* Delete confirmation */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Delete Task</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to delete this task? This cannot be undone.</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" color="error" onClick={performDelete}>Delete</Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar top-right */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </ThemeProvider>
  );
};

export default TaskManagementPage;
