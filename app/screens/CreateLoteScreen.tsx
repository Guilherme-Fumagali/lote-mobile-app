import { useState } from 'react';
import { View, Text, TextInput, Button, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { api } from '../api/api';
import { useNavigation } from '@react-navigation/native';

export default function CreateLoteScreen() {
    const [nome, setNome] = useState('');
    const [validade, setValidade] = useState(new Date());
    const [showPicker, setShowPicker] = useState(false);

    const navigation = useNavigation();

    const handleSubmit = async () => {
        try {
            await api.post('/lotes', {
                nome,
                validade: validade.toISOString().split('T')[0], // YYYY-MM-DD
            });
            navigation.goBack();
        } catch (e) {
            console.error('Erro ao salvar lote', e);
        }
    };

    const onChange = (event: any, selectedDate?: Date) => {
        setShowPicker(Platform.OS === 'ios');
        if (selectedDate) setValidade(selectedDate);
    };

    return (
        <View style={{ padding: 16 }}>
            <Text>Nome do Lote:</Text>
            <TextInput
                style={{
                    borderWidth: 1,
                    padding: 8,
                    marginBottom: 16,
                    borderRadius: 6,
                }}
                value={nome}
                onChangeText={setNome}
                placeholder="Ex: Lote 123"
            />

            <Text>Validade:</Text>
            <Button title={validade.toDateString()} onPress={() => setShowPicker(true)} />
            {showPicker && (
                <DateTimePicker
                    locale="pt-BR"
                    value={validade}
                    mode="date"
                    display="default"
                    onChange={onChange}
                />
            )}

            <View style={{ marginTop: 24 }}>
                <Button title="Salvar Lote" onPress={handleSubmit} />
            </View>
        </View>
    );
}
