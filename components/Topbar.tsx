import { View, TouchableOpacity, Text } from 'react-native'
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import React from 'react'

const Topbar = () => {
  return (
    <View className="  w-full h-10 mt-1 flex flex-row justify-between px-4 bg-[#1a1a1a]">
        <View className="flex flex-row items-center gap-x-2">
          <TouchableOpacity>
            <FontAwesome6 name="people-group" size={18} color="#cd7f32" />
          </TouchableOpacity>
          <TouchableOpacity className="flex flex-row items-center gap-x-1 p-1">
            <AntDesign name="wallet" size={18} color="#cd7f32" className=''/>
            {/* <Text className="text-sm">Wallet</Text> */}
          </TouchableOpacity>
        </View>
        <Text className='text-[#cd7f32]'>Battle Arena</Text>
        <View className="flex flex-row items-center gap-x-2">

        <TouchableOpacity className="flex flex-row items-center gap-x-1 p-1">
        <AntDesign name="Trophy" size={18} color="#cd7f32" />
          {/* <Text className="text-sm">settings</Text> */}
        </TouchableOpacity>
        <TouchableOpacity className="flex flex-row items-center gap-x-1 p-1">
          <Feather name="settings" size={18} color="#cd7f32" />
          {/* <Text className="text-sm">settings</Text> */}
        </TouchableOpacity>
        </View>

      </View>
  )
}

export default Topbar