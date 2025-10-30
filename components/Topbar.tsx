import AntDesign from '@expo/vector-icons/AntDesign'
import Feather from '@expo/vector-icons/Feather'
import FontAwesome6 from '@expo/vector-icons/FontAwesome6'
import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

const Topbar = () => {
  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <TouchableOpacity>
          <FontAwesome6 name="people-group" size={18} color="#cd7f32" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <AntDesign name="wallet" size={18} color="#cd7f32" />
        </TouchableOpacity>
      </View>
      <Text style={styles.title}>Battle Arena</Text>
      <View style={styles.rightSection}>
        <TouchableOpacity style={styles.iconButton}>
          <AntDesign name="Trophy" size={18} color="#cd7f32" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <Feather name="settings" size={18} color="#cd7f32" />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 40,
    marginTop: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#1a1a1a',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 4,
  },
  title: {
    color: '#cd7f32',
  },
})

export default Topbar
