import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Modal, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen = ({ navigation }) => {
  const [events, setEvents] = useState([]);
  const [clubList, setClubList] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isClubListVisible, setIsClubListVisible] = useState(false);
  const [isEventDetailsVisible, setIsEventDetailsVisible] = useState(false);
  const [isGeneralMenuVisible, setIsGeneralMenuVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');


  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedEvents = await AsyncStorage.getItem('events');
        if (storedEvents) {
          setEvents(JSON.parse(storedEvents));
        } else {
          setEvents([]);
        }

        const storedClubs = await AsyncStorage.getItem('clubs');
        if (storedClubs) {
          setClubList(JSON.parse(storedClubs));
        } else {
          setClubList([]);
        }
      } catch (error) {
        Alert.alert('Error', 'No se pudieron cargar los datos.');
        console.error(error);
      }
    };

    fetchData();
  }, []); 

  const handleDeleteEvent = async (eventName) => {
    const updatedEvents = events.filter((event) => event.eventName !== eventName);
  
    try {
      await AsyncStorage.setItem('events', JSON.stringify(updatedEvents));
      setEvents(updatedEvents);
      Alert.alert('Éxito', 'Evento eliminado.');
    } catch (error) {
      Alert.alert('Error', 'No se pudo eliminar el evento.');
      console.error(error);
    }
  };
  
  
  const handleAddClubToEvent = async (club) => {
    if (!selectedEvent) {
      Alert.alert('Error', 'Selecciona un evento primero.');
      return;
    }
  
    const event = events.find((event) => event.eventName === selectedEvent.eventName);
  
    if (event && event.clubs && event.clubs.some(existingClub => existingClub.name === club.name)) {
      Alert.alert('Advertencia', 'Este club ya ha sido añadido a este evento.');
      return;
    }
  
    const updatedEvents = events.map((event) => {
      if (event.eventName === selectedEvent.eventName) {
        return {
          ...event,
          clubs: event.clubs ? [...event.clubs, club] : [club], 
        };
      }
      return event;
    });
  
    try {
      await AsyncStorage.setItem('events', JSON.stringify(updatedEvents));
      setEvents(updatedEvents);  
      Alert.alert('Éxito', 'Club añadido al evento.');
      setIsClubListVisible(false); 
    } catch (error) {
      Alert.alert('Error', 'No se pudo añadir el club.');
      console.error(error);
    }
  };
  
  const handleRemoveClubFromEvent = async (club) => {
    if (!selectedEvent) {
      Alert.alert('Error', 'Selecciona un evento primero.');
      return;
    }
  
    const updatedEvents = events.map((event) => {
      if (event.eventName === selectedEvent.eventName) {
        // Filtra los clubes para eliminar solo el que se seleccionó
        const updatedClubs = event.clubs.filter((c) => c.name !== club.name);
        return { ...event, clubs: updatedClubs }; // Actualiza solo los clubes de este evento
      }
      return event; // No cambia el evento si no es el seleccionado
    });
  
    try {
      await AsyncStorage.setItem('events', JSON.stringify(updatedEvents));
      setEvents(updatedEvents); // Actualiza el estado con los nuevos eventos
      Alert.alert('Éxito', 'Club eliminado del evento.');
    } catch (error) {
      Alert.alert('Error', 'No se pudo eliminar el club.');
      console.error(error);
    }
  };
  
  

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setIsClubListVisible(true);
  };

  const handleViewEventDetails = (event) => {
    setSelectedEvent(event);
    setIsEventDetailsVisible(true);
  };

  const clearEvents = async () => {
    try {
      await AsyncStorage.removeItem('events');
      setEvents([]);
      Alert.alert('Éxito', 'Todos los eventos han sido borrados.');
    } catch (error) {
      Alert.alert('Error', 'No se pudieron borrar los eventos.');
      console.error(error);
    }
  };

  const refreshEvents = async () => {
    try {
      const storedEvents = await AsyncStorage.getItem('events');
      if (storedEvents) {
        setEvents(JSON.parse(storedEvents));
      } else {
        setEvents([]);
        Alert.alert('Sin eventos', 'No hay eventos registrados.');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudieron actualizar los eventos.');
      console.error(error);
    }
  };

  const refreshClubList = async () => {
    try {
      const storedClubs = await AsyncStorage.getItem('clubs');
      if (storedClubs) {
        setClubList(JSON.parse(storedClubs));
        Alert.alert('Éxito', 'Clubes actualizados.');
      } else {
        setClubList([]);
        Alert.alert('Sin clubes', 'No hay clubes registrados.');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudieron actualizar los clubes.');
      console.error(error);
    }
  };

  return (
    <LinearGradient colors={['#d6ffb3', '#87e4d1']} style={styles.container}>
  <View style={styles.eventsContainer}>
    <View style={styles.header}>
      <Text style={styles.eventsTitle}>Reuniones</Text>
      <TouchableOpacity style={styles.updateButton} onPress={refreshEvents}>
        <Text style={styles.updateButtonText}>Actualizar</Text>
      </TouchableOpacity>
    </View>

    <ScrollView>
      {events.length > 0 ? (
        events.map((event, index) => (
          <View key={index} style={styles.eventCard}>
            <TouchableOpacity onPress={() => (event)}>
              <Text style={styles.eventTitle}>{event.eventName}</Text>
              <Text style={styles.eventDescription}>{event.eventDescription}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.editButton}
              onPress={() => handleSelectEvent(event)}
            >
              <Text style={styles.buttonText}>Ver Clubes</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.editButton}
              onPress={() => handleViewEventDetails(event)}
            >
              <Text style={styles.buttonText}>Ver Detalles del Evento</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteEvent(event.eventName)}
            >
              <Text style={styles.buttonText}>Borrar</Text>
            </TouchableOpacity>
          </View>
        ))
      ) : (
        <Text style={styles.noEventsText}>No hay eventos registrados.</Text>
      )}
    </ScrollView>
  </View>

  <View style={styles.generalMenuContainer}>
    <TouchableOpacity
      style={[styles.generalButton, { backgroundColor: '#4CAF50', paddingVertical: 15, paddingHorizontal: 20, borderRadius: 5 }]}
      onPress={() => setIsGeneralMenuVisible(!isGeneralMenuVisible)}
    >
      <Text style={[styles.buttonText, { color: 'white', fontWeight: 'bold' }]}>Opciones</Text>
    </TouchableOpacity>
    {isGeneralMenuVisible && (
      <View style={styles.generalMenuOptions}>
        <TouchableOpacity
          style={[styles.optionButton, { backgroundColor: '#007BFF', marginBottom: 10 }]}
          onPress={() => navigation.navigate('Eventos')}
        >
          <Text style={[styles.buttonText, { color: 'white' }]}>Crear Evento</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.optionButton, { backgroundColor: '#FFC107', marginBottom: 10 }]}
          onPress={() => navigation.navigate('Clubes')}
        >
          <Text style={[styles.buttonText, { color: 'white' }]}>Añadir Club</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.optionButton, { backgroundColor: '#FF6347' }]}
          onPress={clearEvents}
        >
          <Text style={[styles.buttonText, { color: 'white' }]}>Borrar Eventos</Text>
        </TouchableOpacity>
      </View>
    )}
  </View>

  <Modal
    visible={isClubListVisible}
    animationType="slide"
    transparent={true}
    onRequestClose={() => setIsClubListVisible(false)}
  >
    <View style={styles.modalOverlay}>
      <View style={styles.modalContainer}>
        <Text style={styles.modalTitle}>
          Agregue Club al Evento: {selectedEvent?.eventName || 'Sin Nombre'}
        </Text>
        <ScrollView style={styles.scrollContainer}>
          {clubList.length > 0 ? (
            clubList.map((club, index) => (
              <View key={index} style={styles.clubItem}>
                {/* Accede a la propiedad 'name' si 'club' es un objeto */}
                <Text style={styles.clubText}>{club?.name || club}</Text>
                <View style={styles.clubButtonsContainer}>
                  <TouchableOpacity
                    style={[styles.clubButton, { backgroundColor: 'green' }]}
                    onPress={() => handleAddClubToEvent(club)}
                  >
                    <Text style={[styles.buttonText, { color: 'white', fontWeight: 'bold' }]}>Agregar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.clubButton, { backgroundColor: 'red' }]}
                    onPress={() => handleRemoveClubFromEvent(club)}
                  >
                    <Text style={[styles.buttonText, { color: 'white', fontWeight: 'bold' }]}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noClubsText}>No hay clubes disponibles.</Text>
          )}
        </ScrollView>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
          <TouchableOpacity
            style={[styles.buttonModal, { backgroundColor: '#FF6347' }]}
            onPress={() => setIsClubListVisible(false)}
          >
            <Text style={[styles.buttonText, { color: 'white', fontWeight: 'bold' }]}>Cerrar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.buttonModal, { backgroundColor: '#4CAF50' }]}
            onPress={refreshClubList}
          >
            <Text style={[styles.buttonText, { color: 'white', fontWeight: 'bold' }]}>Actualizar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>

  <Modal
    visible={isEventDetailsVisible}
    animationType="slide"
    transparent={true}
    onRequestClose={() => setIsEventDetailsVisible(false)}
  >
   <View style={styles.modalOverlay}>
  <View style={styles.modalContainer}>
    <Text style={styles.modalTitle}>Detalles del Evento</Text>
    
    <View style={styles.detailSection}>
      <Text style={styles.sectionLabel}>🎉 Nombre del Evento:</Text>
      <Text style={styles.sectionText}>{selectedEvent?.eventName || 'Sin Nombre'}</Text>
    </View>
    
    <View style={styles.detailSection}>
      <Text style={styles.sectionLabel}>📅 Fecha:</Text>
      <Text style={styles.sectionText}>{selectedEvent?.eventDate || 'Sin Fecha'}</Text>
    </View>
    
    <View style={styles.detailSection}>
      <Text style={styles.sectionLabel}>📂 Categoría:</Text>
      <Text style={styles.sectionText}>
        {selectedEvent?.categories ? selectedEvent.categories.join(', ') : 'Sin Categorías'}
      </Text>
    </View>

    <View style={styles.detailSection}>
      <Text style={styles.sectionLabel}>👥 Clubes:</Text>
    </View>

    <View style={styles.container}>
      {/* Nuevo botón agregado */}
      <TouchableOpacity
        style={[styles.button, { justifyContent: 'center', alignItems:'center', alignSelf: 'center' }]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.buttonAsisten}>Ver Asistencia</Text>
      </TouchableOpacity>
      
      <Modal
  visible={modalVisible}
  animationType="slide"
  transparent
  onRequestClose={() => setModalVisible(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Asistencia</Text>

      {/* Barra de búsqueda */}
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar club..."
        value={searchQuery}
        onChangeText={(text) => setSearchQuery(text)}
      />

      {/* ScrollView para la lista de clubes */}
      <ScrollView contentContainerStyle={styles.clubListContainer}>
        {/* Lista de clubes filtrados */}
        {selectedEvent?.clubs && selectedEvent.clubs.length > 0 ? (
          selectedEvent.clubs
            .filter((club) =>
              (club?.name || club)
                .toLowerCase()
                .includes(searchQuery.toLowerCase())
            )
            .map((club, index) => (
              <Text key={index} style={styles.clubText}>
                {club?.name || club}
              </Text>
            ))
        ) : (
          <Text style={styles.noClubsText}>No hay clubes asignados.</Text>
        )}
      </ScrollView>

      {/* Botón para cerrar el modal */}
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => setModalVisible(false)}
      >
        <Text style={styles.closeButtonText}>Cerrar</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

    </View>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => setIsEventDetailsVisible(false)}
        >
          <Text style={styles.closeButtonText}>Cerrar</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
</LinearGradient>
  );
};

const styles = StyleSheet.create({
   container: {
    flex: 1,
  }, 
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  buttonAsisten: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16, 
    alignItems: 'center',
    justifyContent: 'center',
    width: 'auto', 
    alignItems: 'center', 
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15, 
    borderRadius: 10,
    alignItems: 'center',
    width: '80%', 
    marginVertical: 10,
    
  },
  
  generalMenuOptions: {
    marginTop: 10,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  clubButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 'auto',
    marginHorizontal: '5', 
  },
  searchInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  clubText: {
    fontSize: 16,
    marginBottom: 5,
  },
  noClubsText: {
    fontSize: 16,
    color: '#888',
  },
  
  clubButton: {
    backgroundColor: '#007BFF',
    padding: 8,
    borderRadius: 5,
    marginLeft: 5,
    justifyContent: 'center',
    alignContent:'center',
  },
  updateButton: {
    backgroundColor: 'blue',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: 300,  
    height: 400, 
    alignSelf: 'center',  
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: '#ff4d4d',
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },

  updateButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  eventsContainer: {
    flex: 2,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  eventsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
  },
  buttonModal:{
    backgroundColor: '#007BFF',
    padding: 12,
    borderRadius: 5,
    marginLeft: 5,
    justifyContent: 'center',
    alignContent:'center',
  },
  deleteButton: {
    backgroundColor: '#FF6347',
    padding: 10,
    marginTop: 5,
    borderRadius: 5,
    alignItems: 'center',
  },
  eventCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderColor: '#ddd',
    borderWidth: 1,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  eventDescription: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
  editButton: {
    backgroundColor: 'orange',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  clubItem: {
    backgroundColor: '#f1f1f1',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  clubText: {
    fontSize: 16,
    color: 'black',
    padding:'8',
    textAlign: 'center',
  },
  removeButton: {
    backgroundColor: '#e00b0b',
    padding: 5,
    borderRadius: 5,
    marginTop: 5,
  },
  generalMenuContainer: {
    position: 'inline-block',
    bottom: 5,
    right: 15,
    alignItems: 'flex-end',
  },
  generalButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 5,
    padding: 50,
  },
  optionButton: {
    padding: 10,
    borderRadius: 5,
  },
  removeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  noEventsText: {
    fontSize: 16,
    color: '#777',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 15,
    width: '80%',
    height: '60%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    justifyContent: 'space-between',

  },
  scrollContainer: {
    maxHeight: '60%',
  },
  buttonsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  button: {
    backgroundColor: 'green',
    padding: 15,
    borderRadius: 25,
    marginBottom: 10,
    width: '80%',
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: '#e00b0b',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  detailSection: {
    marginBottom: 15,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
  },
  sectionText: {
    fontSize: 16,
    color: '#333',
    marginTop: 5,
  },
  noClubsText: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
    color: 'gray',
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: '#FF6347',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignSelf: 'center',
    marginTop: 20,
    backgroundColor: 'red',
    padding: 6,
    borderRadius: 25, 
    alignItems: 'center',
    marginTop: 8, 
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
});

export default HomeScreen;

