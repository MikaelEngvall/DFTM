import { taskApi, TaskPriority, TaskStatus } from '../services/api/taskApi';

// Funktion för att skapa exempeluppgifter
async function createExampleTasks() {
  try {
    console.log('Skapar exempeluppgifter...');

    // Mikael Engvall är tilldelare
    const assignerId = ''; // Mikael Engvalls ID - fyll i detta
    
    // Regular user är tilldelad
    const assignedToId = ''; // Regular user ID - fyll i detta

    // Uppgift med dagens datum
    const today = new Date();
    const formattedToday = today.toISOString().split('T')[0];

    await taskApi.createTask({
      title: 'Granska dokumentation',
      description: 'Granska den tekniska dokumentationen för backend-systemet före publicering.',
      status: TaskStatus.PENDING,
      priority: TaskPriority.MEDIUM,
      assignedTo: assignedToId,
      assigner: assignerId,
      dueDate: formattedToday,
      archived: false,
      approved: false
    });
    console.log('Uppgift 1 skapad för idag.');

    // Uppgift med datum nästa vecka
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    const formattedNextWeek = nextWeek.toISOString().split('T')[0];

    await taskApi.createTask({
      title: 'Implementera JWT-autentisering',
      description: 'Integrera JWT-autentisering i frontend-applikationen och testa mot backend-API:et.',
      status: TaskStatus.PENDING,
      priority: TaskPriority.HIGH,
      assignedTo: assignedToId,
      assigner: assignerId,
      dueDate: formattedNextWeek,
      archived: false,
      approved: false
    });
    console.log('Uppgift 2 skapad för nästa vecka.');

    // Uppgift med datum förra veckan (försenad)
    const lastWeek = new Date();
    lastWeek.setDate(today.getDate() - 7);
    const formattedLastWeek = lastWeek.toISOString().split('T')[0];

    await taskApi.createTask({
      title: 'Uppdatera användarhandboken',
      description: 'Uppdatera användarhandboken med de senaste funktionerna som implementerats.',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.URGENT,
      assignedTo: assignedToId,
      assigner: assignerId,
      dueDate: formattedLastWeek,
      archived: false,
      approved: false
    });
    console.log('Uppgift 3 skapad för förra veckan (försenad).');

    console.log('Alla exempeluppgifter har skapats framgångsrikt!');
  } catch (error) {
    console.error('Fel vid skapande av exempeluppgifter:', error);
  }
}

// Kör funktionen
createExampleTasks(); 