import {useCallback, useEffect, useState} from 'react';
import {
    View,
    Text,
    FlatList,
    Alert,
    TouchableOpacity,
    RefreshControl,
    StyleSheet, Platform, TextInput
} from 'react-native';
import { getAllLotes, deleteLote } from '../api/api';
import { Lote } from '../types/Lote';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import {Camera, CameraView} from "expo-camera";
export default function HomeScreen() {
    const [lotesOriginais, setLotesOriginais] = useState<Lote[]>([]);
    const [lotesFiltrados, setLotesFiltrados] = useState<Lote[]>([]);
    const [busca, setBusca] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [showScanner, setShowScanner] = useState(false);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const navigation = useNavigation();

    useEffect(() => {
        (async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
        })();
    }, []);

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
    }

    const handleBarCodeScanned = ({ data }: { data: string }) => {
        setShowScanner(false);
        filtrarLotes(data); // filtra automaticamente
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

            <View style={styles.buscaContainer}>
                <TextInput
                    placeholder="Buscar por código..."
                    value={busca}
                    onChangeText={filtrarLotes}
                    style={styles.inputBusca}
                    placeholderTextColor="#666"
                />
                <TouchableOpacity onPress={() => setShowScanner(!showScanner)} style={styles.scanButton}>
+                    <Ionicons name="barcode-outline" size={24} color="#333" />
                </TouchableOpacity>
            </View>


            {/* Scanner de código de barras */}
            {showScanner && hasPermission && (
                <CameraView
                    onBarcodeScanned={handleBarCodeScanned}
                    style={{ flex: 1 }}
                />
            )}

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
                            <Text style={styles.texto}>
                                Validade: {new Date(item.validade).toLocaleDateString('pt-BR')}
                            </Text>
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
        fontFamily: Platform.select({ios: 'Courier', android: 'monospace'}),
        backgroundColor: '#e0f0ff',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        color: '#003366',
        fontWeight: 'bold',
    },
    buscaContainer: {
        flexDirection: 'row',
        alignItems: 'center', // Alinha verticalmente
        marginBottom: 12,
    },
    inputBusca: {
        flex: 1, // Ocupa o espaço restante
        backgroundColor: '#f0f0f0',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    scanButton: {
        width: 48,
        height: 48, // Igual altura do input (aproximadamente)
        marginLeft: 8,
        backgroundColor: '#e0e0e0',
        borderRadius: 8,
        justifyContent: 'center', // Alinha verticalmente o ícone
        alignItems: 'center',     // Alinha horizontalmente o ícone
    },
});
