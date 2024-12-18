import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { SearchBar } from 'react-native-elements'; 
import * as Animatable from 'react-native-animatable';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { TextInput } from 'react-native';
//import * as Notifications from 'expo-notifications';
import { URL_API } from '../../utils/api-utils';



//notificação
//Notifications.setNotificationHandler({
 // handleNotification: async () => ({
   // shouldShowAlert: true,
  //  shouldSetBadge: true,
    //shouldSetBadge: true,
  //}),
//});



export default function Depositar() {
  const navigation = useNavigation();
  const [selectedButton, setSelectedButton] = useState(null);
  const [nomeMorador, setNomeMorador] = useState('');
  const [idMorador, setIdMorador] = useState(0);
  const [sugestoes, setSugestoes] = useState([]);
  const [todosMoradores, setTodosMoradores] = useState([]);
  const [entregaId, setEntregaId] = useState(null);
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  

  const handleButtonPress = (buttonType, entregaId) => {
    setSelectedButton(buttonType);
    setEntregaId(entregaId);
  }; 

  const buscarMoradores = async () => {
    if (!nomeMorador) return;
    setLoading(true);
    try {
      const response = await fetch(URL_API + `/buscar_morador?nome=${nomeMorador}`, {
        method: 'GET'
      });
      if (!response.ok) throw new Error('Erro na rede');
  
      const data = await response.json();
      console.log(data); 
      if (data.length > 0) {
        setIdMorador(data[0].id);
        setTodosMoradores(data);
      } else {
        alert('Nenhum morador encontrado.');
      }
    } catch (error) {
      
      } finally {
        setLoading(false); 
    
    
      setLoading(false);
    }
  };

  useEffect(() => {
    if (nomeMorador.length > 2) {  
      buscarMoradores();
    }
  }, [nomeMorador]);
  useEffect(() => {
    if (nomeMorador.length > 0) {
      const filtered = todosMoradores.filter((morador) =>
        morador.nome.toLowerCase().includes(nomeMorador.toLowerCase())
      );
      setSugestoes(filtered);
    } else {
      setSugestoes([]);
    }
  }, [nomeMorador, todosMoradores]);


  

  const selecionarMorador = (morador) => {
    setNomeMorador(`${morador.nome} ${morador.sobrenome}`);
    setIdMorador(morador.id);
    setEntregaId(morador.id);
    setSugestoes([]);
    
    console.log(`Morador selecionado: ${morador.nome} ${morador.sobrenome}`); 
    
  };

//notificação
//  const enviarNotificacao = async (token) => {
   
    //await Notifications.scheduleNotificationAsync({
    //  content: {
     //   title: 'Notificação',
      //  body: 'Eba, sua encomenda chegou',
       // data: {},
      //},
      //trigger: {
       /// seconds: 5,
     // },
    ///});
 // };
  

    

  const depositarEntrega = async () => {
    if (!entregaId) {
      alert('Por favor, selecione um morador para depositar.');
      return;
    }
    if (!senha) {
      alert('Por favor, digite a senha.');
      return;
    }
  
    try {
      const response = await fetch( URL_API + '/depositar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          morador_id: idMorador,
          senha: senha,
          nome_completo: nomeMorador, 
          N_ap: 'Ap',
          armario_id: selectedButton === 'pequena' ? 1 : 2 
        }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        
        //const token = await registrarToken(idMorador); // token do morador
        //await enviarNotificacao(token);


        alert('Coloque o pacote no armário disponível!');
        
        navigation.navigate('Home');
      } else {
        alert(data.message || 'Erro ao registrar entrega');
      }
    } catch (error) {
      console.error('Erro ao depositar entrega:', error);
    }
  };


  return (
    <View style={styles.container}>
      <Animatable.View>
        <Text style={styles.message}>Selecione o tamanho</Text>
      </Animatable.View>

      <View style={styles.buttonCaixa}>
        <TouchableOpacity
          style={[styles.squareButton, selectedButton === 'pequena' && { backgroundColor: '#32CD32' }]}
          onPress={() => handleButtonPress('pequena', 1)}
        >
          <View style={styles.iconContainer}>
            <Icon name="cube" size={20} color="#000" />
          </View>
          <Text style={styles.messagetextCaixa}>PEQUENA</Text>
          <Text style={styles.messagetextCaixa}>(Até Xcm)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.squareButton, selectedButton === 'media' && { backgroundColor: '#32CD32' }]}
          onPress={() => handleButtonPress('media', 2)}
        >
          <View style={styles.iconContainer}>
            <Icon name="cube" size={20} color="#000" />
          </View>
          <Text style={styles.messagetextCaixa}>MÉDIA</Text>
          <Text style={styles.messagetextCaixa}>(Até Xcm)</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        <Text style={styles.title}>Buscar Morador</Text>
        <SearchBar
          placeholder="Digite o nome do morador..."
          onChangeText={(text) => setNomeMorador(text)}
          value={nomeMorador}
          lightTheme
          round
          containerStyle={styles.searchBarContainer}
          inputContainerStyle={styles.searchInput}
        />

        {loading ? (
          <ActivityIndicator size="large" color="#fff" />
        ) : (
          sugestoes.length > 0 && (
            <FlatList
              data={sugestoes}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.sugestaoItem}
                  onPress={() => selecionarMorador(item)}
                >
                  <Text style={styles.listItemText}>
                    {item.nome.toUpperCase()} {item.sobrenome.toUpperCase()} Ap {item.N_ap}
                  </Text> 
                </TouchableOpacity>
              )}
              style={styles.sugestoesContainer}
            />
          )
        )}

        {entregaId && <Text style={styles.selectedText}>Selecionar Morador: {nomeMorador}</Text>}
      </View>

      <View style={styles.senhaContainer}>
        <Animatable.View>
          <Text style={styles.messageSenha}>Digite Sua Senha</Text>
        </Animatable.View>

        <TextInput
          placeholder="Digite sua senha..."
          style={styles.input}
          secureTextEntry={true}
          value={senha}
          onChangeText={setSenha}
        />

        <TouchableOpacity style={styles.buttonAbrir} onPress={depositarEntrega}>
          <Text style={styles.buttonText}>Depositar entrega</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D3D3D3',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  message: {
    fontSize: 22,
    color: '#333',
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  buttonCaixa: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 30,
  },
  squareButton: {
    width: 100,
    height: 100,
    backgroundColor: '#fff',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  messagetextCaixa: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 5,
  },
  iconContainer: {
    position: 'absolute',
    top: 10,
  },
  searchBarContainer: {
    backgroundColor: '#D3D3D3',
    borderTopWidth: 0,
    borderBottomWidth: 0,
    marginTop: 20,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 5,
  },
  sugestoesContainer: {
    maxHeight: 200,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    borderRadius: 5,
    zIndex: 10,
    padding: 30,
  },
  sugestaoItem: {
    borderBottomColor: '#ccc',
  },
  listItemText: {
    color: '#000',
    fontSize: 14,
  },
  selectedText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  senhaContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  messageSenha: {
    fontSize: 20,
    color: '#333',
    marginBottom: 10,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 5,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  buttonAbrir: {
    backgroundColor: '#006400',
    borderRadius: 5,
    paddingVertical: 15,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
