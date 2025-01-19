import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Alert, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AntDesign from '@expo/vector-icons/AntDesign';

const ClubScreen = () => {
  const [clubName, setClubName] = useState('');
  const [clubDistrict, setClubDistrict] = useState('');
  const [aventureros, setAventureros] = useState('');
  const [conquistadores, setConquistadores] = useState('');
  const [guias, setGuias] = useState('');
  const [clubList, setClubList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredClubs, setFilteredClubs] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [statsModalVisible, setStatsModalVisible] = useState(false); // Nuevo estado para el modal de estadísticas
  const [districtModalVisible, setDistrictModalVisible] = useState(false); 

  // Lista de distritos
  const districts = [
    '1. Central', 
    '2. Filipinas', 
    '3. Villa Magdalena',
    '4. Restauracion', 
    '5. Barrio Mexico',
    '6. Quisqueya',
    '7. Villa Progreso',
    '8. Sendero de Esperanza',
    '9. Sarmiento',
    '10. Placer Bonito',
  ];

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const savedClubs = await AsyncStorage.getItem('clubs');
        if (savedClubs) {
          const parsedClubs = JSON.parse(savedClubs);
          setClubList(parsedClubs);
          setFilteredClubs(parsedClubs);
        }
      } catch (error) {
        console.error('Error fetching clubs:', error);
      }
    };

    fetchClubs();
  }, []);

  const saveClub = async () => {
    if (clubName.trim() === '' || clubDistrict.trim() === '') return;

    const newClub = { 
      name: clubName, 
      district: clubDistrict, 
      aventu: aventureros.trim() || 'No tiene',
      conquis: conquistadores.trim() || 'No tiene',
      guia: guias.trim() || 'No tiene',
    };

    const updatedClubs = [...clubList, newClub];
    setClubList(updatedClubs);
    setFilteredClubs(updatedClubs);
    setClubName('');
    setClubDistrict('');
    setAventureros('');
    setConquistadores('');
    setGuias('');

    try {
      await AsyncStorage.setItem('clubs', JSON.stringify(updatedClubs));
    } catch (error) {
      console.error('Error saving club:', error);
    }

    setModalVisible(false);
  };

  const deleteClub = async (clubNameToDelete) => {
    Alert.alert(
      'Confirmación',
      `¿Estás seguro de que deseas borrar el club "${clubNameToDelete}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Borrar',
          onPress: async () => {
            const updatedClubs = clubList.filter((club) => club.name !== clubNameToDelete);
            setClubList(updatedClubs);
            setFilteredClubs(updatedClubs);

            try {
              await AsyncStorage.setItem('clubs', JSON.stringify(updatedClubs));
            } catch (error) {
              console.error('Error deleting club:', error);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const filterClubs = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredClubs(clubList);
    } else {
      const filtered = clubList.filter((club) =>
        club.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredClubs(filtered);
    }
  };

  const sortClubs = (criteria) => {
    const sortedClubs = [...filteredClubs].sort((a, b) => {
      if (criteria === 'name') {
        return a.name.localeCompare(b.name);
      } else if (criteria === 'district') {
        return a.district.localeCompare(b.district);
      }
      return 0;
    });
    setFilteredClubs(sortedClubs);
  };

  const handleSort = () => {
    Alert.alert(
      'Ordenar Clubes',
      'Selecciona un criterio para ordenar:',
      [
        { text: 'Por Nombre', onPress: () => sortClubs('name') },
        { text: 'Por Distrito', onPress: () => sortClubs('district') },
        { text: 'Cancelar', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const getClubCounts = () => {
    let aventurerosCount = 0;
    let conquistadoresCount = 0;
    let guiasCount = 0;

    clubList.forEach((club) => {
      if (club.aventu && club.aventu !== 'No tiene') aventurerosCount++;
      if (club.conquis && club.conquis !== 'No tiene') conquistadoresCount++;
      if (club.guia && club.guia !== 'No tiene') guiasCount++;
    });

    return { aventurerosCount, conquistadoresCount, guiasCount };
  };

  const renderClub = ({ item }) => (
    <View style={styles.clubContainer}>
      <View>
        <Text style={styles.clubItem}>Nombre: {item.name}</Text>
        <Text style={styles.clubItem}>Distrito: {item.district}</Text>
        <Text style={styles.clubItem}>Aventureros: {item.aventu}</Text>
        <Text style={styles.clubItem}>Conquistadores: {item.conquis}</Text>
        <Text style={styles.clubItem}>Guias: {item.guia}</Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteClub(item.name)}
      >
        <Text style={styles.buttonText}>Eliminar</Text>
      </TouchableOpacity>
    </View>
  );

  const { aventurerosCount, conquistadoresCount, guiasCount } = getClubCounts();

  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  const toggleStatsModal = () => {
    setStatsModalVisible(!statsModalVisible); // Mostrar u ocultar el modal de estadísticas
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.newClubButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.buttonText}>Nuevo Club</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sortButton} onPress={handleSort}>
          <Text style={styles.buttonText}>Ordenar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.rowHeader}>
        <Text style={styles.listadoText}>Listado</Text>
        <TextInput
          style={styles.inputSearch}
          placeholder="Buscar Club"
          value={searchQuery}
          onChangeText={filterClubs}
        />

        <AntDesign name="caretup" size={20} color="white" style={{ marginTop: 5 }} onPress={toggleStatsModal} />
      </View>


      <FlatList
        data={filteredClubs}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderClub}
      />

      {/* Modal para mostrar las estadísticas */}
      <Modal
        visible={statsModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={toggleStatsModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.title}>Estadísticas de Clubes</Text>
            <Text style={styles.clubItem}>Total Clubes: {filteredClubs.length}</Text>
            <Text style={styles.clubItem}>Aventureros: {aventurerosCount}</Text>
            <Text style={styles.clubItem}>Conquistadores: {conquistadoresCount}</Text>
            <Text style={styles.clubItem}>Guias: {guiasCount}</Text>
            <TouchableOpacity style={styles.button} onPress={toggleStatsModal}>
              <Text style={styles.buttonTxt}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal para registrar un nuevo club */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.title}>Registrar Club</Text>

            <TextInput
              style={styles.input}
              placeholder="Nombre"
              value={clubName}
              onChangeText={setClubName}
            />

            <TouchableOpacity
              style={styles.districtButton}
              onPress={() => setDistrictModalVisible(true)}
            >
              <Text style={styles.districtButtonText}>
                {clubDistrict ? clubDistrict : 'Selecciona Distrito'}
              </Text>
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="Aventureros"
              value={aventureros}
              onChangeText={setAventureros}
            />
            <TextInput
              style={styles.input}
              placeholder="Conquistadores"
              value={conquistadores}
              onChangeText={setConquistadores}
            />
            <TextInput
              style={styles.input}
              placeholder="Guias"
              value={guias}
              onChangeText={setGuias}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.button} onPress={saveClub}>
                <Text style={styles.buttonText}>Guardar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        visible={districtModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDistrictModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.title}>Selecciona un Distrito</Text>

            <FlatList
              data={districts}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.districtOption}
                  onPress={() => {
                    setClubDistrict(item);
                    setDistrictModalVisible(false);
                  }}
                >
                  <Text style={styles.districtOptionText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};
    


const styles = StyleSheet.create({


  container: {
    flex: 1,
    padding: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  newClubButton: {
    backgroundColor: '#1e90ff',
    padding: 10,
    borderRadius: 5,
  },
  sortButton: {
    backgroundColor: '#ff6347',
    padding: 10,
    borderRadius: 5,
  },
  totalClubsText: {
    fontSize: 16,
    marginBottom: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
  },
  inputSearch: {
    flex: 1,
    marginHorizontal: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    marginVertical: 10,
  },

  
  title: {
    fontSize: 18,
    marginBottom: 10,
  },
  input: {
    borderBottomWidth: 1,
    marginBottom: 10,
    padding: 5,
  },
  districtButton: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    marginBottom: 10,
  },
  districtButtonText: {
    fontSize: 16,
    color: '#000',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    backgroundColor: '#aaa',
  },
  districtOption: {
    padding: 10,
  },
  districtOptionText: {
    fontSize: 16,
  },
  clubContainer: {
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
  },
  clubItem: {
    fontSize: 14,
  },
  deleteButton: {
    backgroundColor: '#ff6347',
    padding: 5,
    borderRadius: 5,
    marginTop: 5,
  },
  districtButton: {
    paddingVertical: 5, 
    paddingHorizontal: 8,  
    backgroundColor: 'gray', 
    marginBottom: 10,  
    borderRadius: 5, 
    alignItems: 'center',
    width: '40%',  
    alignSelf: 'center',  
  },
  
districtButtonText: {
    fontWeight: 'bold',
    fontSize: 14, 
    color: '#000',
    textAlign: 'center', 
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
  },

  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  newClubButton: {
    flex: 1,
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 8,
    marginRight: 5,
    alignItems: 'center',
    Top: 40,
  },
  
  sortButton: {
    flex: 1,
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 8,
    marginLeft: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  inputSearch: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    backgroundColor: '#fff',
    padding: 7,
    marginBottom: 6,
    right: 120,
  },
  totalClubsText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  clubContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    marginTop: 10,
    marginBottom: 5,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  clubItem: {
    fontSize: 16,
    color: '#495057',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    padding: 8,
    borderRadius: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    backgroundColor: '#fff',
    padding: 10,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: '#333',  
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },  
  buttonTxt: {
    color: 'white', 
    fontWeight: 'bold',
    fontSize: 16, 
    textAlign: 'center',
  },
  cancelButton: {
    backgroundColor: '#dc3545',
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#000',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  listadoText: {
    color: '#fff', 
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 1,
    color: 'white', 
  },
  inputSearch: {
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 8,
    backgroundColor: 'white',
    color: 'black',
    padding: 6,
    width: '70%',
    marginRight: 3,
    marginLeft: 9, 
  },
  districtButton: { 
    borderColor: '#ddd', 
    borderWidth: 1, 
    borderRadius: 5, 
    padding: 12, 
    marginBottom: 12, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  districtButtonText: { 
    fontSize: 16, 
    color: '#555' 
  },
  districtOption: { 
    padding: 12, 
    borderBottomWidth: 1,
    borderBottomColor: '#ddd' 
  },
  districtOptionText: { 
    fontSize: 16 
  },
});
export default ClubScreen;