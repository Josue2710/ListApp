import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ScrollView,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EventScreen = () => {
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [clubList, setClubList] = useState([]);
  const [selectedClubs, setSelectedClubs] = useState([]);
  const [showClubModal, setShowClubModal] = useState(false);

  // Cargar los clubes desde AsyncStorage al montar el componente
  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    try {
      const savedClubs = await AsyncStorage.getItem('clubs');
      if (savedClubs) {
        const parsedClubs = JSON.parse(savedClubs);
        // Asegúrate de que cada club tenga un formato consistente
        const formattedClubs = parsedClubs.map((club) =>
          typeof club === 'string' ? { name: club } : club
        );
        setClubList(formattedClubs);
      }
    } catch (error) {
      console.error('Error fetching clubs:', error);
    }
  };
  
  const toggleCategory = (category) => {
    setSelectedCategories((prevCategories) =>
      prevCategories.includes(category)
        ? prevCategories.filter((cat) => cat !== category)
        : [...prevCategories, category]
    );
  };

  const toggleClubSelection = (club) => {
    setSelectedClubs((prevClubs) =>
      prevClubs.includes(club)
        ? prevClubs.filter((c) => c !== club)
        : [...prevClubs, club]
    );
  };

  const saveEvent = async () => {
    if (!eventName || !eventDate || selectedCategories.length === 0) {
      Alert.alert('Error', 'Por favor, completa todos los campos obligatorios.');
      return;
    }

    const newEvent = {
      eventName,
      eventDate,
      eventDescription,
      categories: selectedCategories,
      clubs: selectedClubs,
    };

    try {
      const existingEvents = JSON.parse((await AsyncStorage.getItem('events')) || '[]');
      await AsyncStorage.setItem('events', JSON.stringify([...existingEvents, newEvent]));

      Alert.alert('Éxito', 'El evento ha sido guardado correctamente.');
      setEventName('');
      setEventDate('');
      setEventDescription('');
      setSelectedCategories([]);
      setSelectedClubs([]);
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el evento.');
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Encabezado con los logotipos en fila */}
      <View style={styles.header}>
        <Image source={require('../assets/img/Avent.png')} style={styles.logo} />
        <Image source={require('../assets/img/Conquis.png')} style={styles.logo} />
        <Image source={require('../assets/img/Guias.png')} style={styles.logo} />
      </View>

      {/* Formulario */}
      <Text style={styles.title}>Crear Evento:</Text>
      <TextInput
        style={styles.input}
        placeholder="Nombre del Evento"
        value={eventName}
        onChangeText={setEventName}
      />
      <TextInput
        style={styles.input}
        placeholder="Fecha (YYYY-MM-DD)"
        value={eventDate}
        onChangeText={setEventDate}
      />
      <TextInput
        style={styles.input}
        placeholder="Descripción (Opcional)"
        value={eventDescription}
        onChangeText={setEventDescription}
      />

      {/* Botones de Categorías */}
      <Text style={styles.categoryTitle}>Categorías:</Text>
      <View style={styles.categories}>
        {['Aventureros', 'Conquistadores', 'Guías', 'Zona'].map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selectedCategories.includes(category) && styles.selectedCategory,
              styles[category.toLowerCase()],
            ]}
            onPress={() => toggleCategory(category)}
          >
            <Text style={styles.categoryText}>{category}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Botón para ver los clubes seleccionados */}
      <TouchableOpacity
        style={styles.showClubButton}
        onPress={() => setShowClubModal(true)}
      >
        <Text style={styles.showClubButtonText}>Seleccionar Clubes Asistentes</Text>
      </TouchableOpacity>

      {/* Modal para seleccionar clubes */}
      <Modal
        visible={showClubModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowClubModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.clubTitle}>Clubes:</Text>
            <ScrollView style={styles.clubs}>
              {clubList.map((club, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.clubButton,
                    selectedClubs.includes(club.name) && styles.selectedClub,
                  ]}
                  onPress={() => toggleClubSelection(club.name)}
                >
                  <Text style={styles.clubText}>{club.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setShowClubModal(false)}
            >
              <Text style={styles.closeModalButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Botón de Actualizar Clubes */}
      <TouchableOpacity
        style={styles.updateClubsButton}
        onPress={() => {
          fetchClubs(); 
          Alert.alert('Éxito', 'Clubes actualizados', [
            { text: 'OK' },
          ]); 
        }}
      >
        <Text style={styles.updateClubsButtonText}>Actualizar Clubes</Text>
      </TouchableOpacity>

      {/* Botón de Guardar */}
      <TouchableOpacity style={styles.saveButton} onPress={saveEvent}>
        <Text style={styles.saveButtonText}>Guardar Evento</Text>
      </TouchableOpacity>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d4f7c5',
    padding: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 5,
  },
  logo: {
    width: 70,
    height: 60,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 5,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: 'white',
    padding: 10,
    marginBottom: 6,
    borderRadius: 5,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    textAlign: 'center',
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap', 
    justifyContent: 'space-around',
    marginBottom: 1,
  },
  categoryButton: {
    paddingVertical: 6, 
    paddingHorizontal: 10, 
    borderRadius: 5,
    width: '45%', 
    alignItems: 'center',
    margin: 5, 
  },
  selectedCategory: {
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  categoryText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12, 
  },
  aventureros: {
    backgroundColor: '#0056b3',
  },
  conquistadores: {
    backgroundColor: '#d32f2f',
  },
  guías: {
    backgroundColor: '#1976d2',
  },
  zona: {
    backgroundColor: '#388e3c',
  },
  showClubButton: {
    backgroundColor: '#388e3c',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 20,
  },
  showClubButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  clubTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    textAlign: 'center',
  },
  clubs: {
    marginBottom: 20,
  },
  clubButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#388e3c',
    margin: 5,
  },
  selectedClub: {
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  clubText: {
    color: 'white',
    fontWeight: 'bold',
  },
  closeModalButton: {
    backgroundColor: 'black',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    alignSelf: 'center',
  },
  closeModalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  updateClubsButton: {
    backgroundColor: '#1976d2',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 20,
  },
  updateClubsButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: 'black',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    alignSelf: 'center',
    width: '50%',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default EventScreen;
