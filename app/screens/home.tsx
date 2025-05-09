import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";
import { Button, Text, View } from "react-native";
export default function HomeScreen() {
  const testPrint = async () => {
    const token = await AsyncStorage.getItem("token");
    console.log(token);
  };
  useEffect(() => {
    testPrint();
  }, []);

  return (
    <View>
      <Text>Home</Text>
      <Button title="Test" onPress={testPrint} />
    </View>
  );
}
