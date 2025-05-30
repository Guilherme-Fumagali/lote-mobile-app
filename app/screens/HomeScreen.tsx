import {useCallback, useEffect, useState} from 'react';
import {
    View,
    Text,
    FlatList,
    Alert,
    TouchableOpacity,
    RefreshControl,
    StyleSheet, Platform, TextInput, Image
} from 'react-native';
import logo from '../../assets/agro-mark-logo.png';
import { getAllLotes, deleteLote } from '../api/api';
import { Lote } from '../types/Lote';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons'; // se estiver usando Expo

export default function HomeScreen() {
    const [lotesOriginais, setLotesOriginais] = useState<Lote[]>([]);
    const [lotesFiltrados, setLotesFiltrados] = useState<Lote[]>([]);
    const [busca, setBusca] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const navigation = useNavigation();
    const fetchLotes = async () => {
        setRefreshing(true);
        try {
            const data = await getAllLotes();
            setLotesOriginais(data);
            setLotesFiltrados(data);
        } catch (error) {
            console.error('Erro ao buscar lotes:', error);
        } finally {
            setRefreshing(false);
        }
    };

    const filtrarLotes = (texto: string) => {
        setBusca(texto);
        const resultado = lotesOriginais.filter((lote) =>
            lote.codigo.toLowerCase().includes(texto.toLowerCase())
        );
        setLotesFiltrados(resultado);
    };
    const confirmDelete = (codigo: string) => {
        Alert.alert('Confirmar exclusão', 'Deseja excluir este lote?', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Excluir',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await deleteLote(codigo);
                        fetchLotes();
                    } catch (error) {
                        console.error('Erro ao excluir lote:', error);
                    }
                },
            },
        ]);
    };

    useFocusEffect(
        useCallback(() => {
            fetchLotes();
        }, [])
    );


    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.novoButton}
                onPress={() => navigation.navigate('Criar Lote')}
            >
                <Ionicons name="add-circle-outline" size={24} color="white" />
                <Text style={styles.novoButtonText}>Novo Lote</Text>
            </TouchableOpacity>

            <TextInput
                placeholder="Buscar por código..."
                value={busca}
                onChangeText={filtrarLotes}
                style={styles.inputBusca}
            />

            <FlatList
                data={lotesFiltrados}
                keyExtractor={(item) => item.codigo}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={fetchLotes} />
                }
                contentContainerStyle={{ paddingBottom: 16 }}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.nome}>{item.nome}</Text>
                            <Text style={styles.texto}>Validade: {new Date(item.validade).toLocaleDateString('pt-BR')}</Text>
                            <View style={styles.codigoContainer}>
                                <Text style={styles.codigoLabel}>Código:</Text>
                                <Text style={styles.codigoValor}>{item.codigo}</Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={() => confirmDelete(item.codigo)}>
                            <Ionicons name="trash-outline" size={24} color="red" />
                        </TouchableOpacity>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    novoButton: {
        flexDirection: 'row',
        backgroundColor: '#4CAF50',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    novoButtonText: {
        color: 'white',
        fontWeight: 'bold',
        marginLeft: 8,
        fontSize: 16,
    },
    card: {
        backgroundColor: '#f8f9fa',
        padding: 16,
        borderRadius: 10,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 2,
    },
    nome: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 4,
    },
    texto: {
        fontSize: 14,
        color: '#555',
    },
    codigoContainer: {
        marginTop: 6,
        flexDirection: 'row',
        alignItems: 'center',
    },

    codigoLabel: {
        fontSize: 14,
        marginRight: 4,
        color: '#333',
        fontWeight: 'bold',
    },

    codigoValor: {
        fontSize: 16,
        fontFamily: Platform.select({ ios: 'Courier', android: 'monospace' }),
        backgroundColor: '#e0f0ff',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        color: '#003366',
        fontWeight: 'bold',
    },
    inputBusca: {
        backgroundColor: '#f0f0f0',
        padding: 10,
        borderRadius: 8,
        marginBottom: 12,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#ccc',
    },
});
