import { GameFonts } from '@/constants/GameFonts'
import { MaterialIcons } from '@expo/vector-icons'
import React, { useState } from 'react'
import {
  Image,
  ImageBackground,
  ImageSourcePropType,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { SvgProps } from 'react-native-svg'

interface SelectionItem {
  id: string
  title: string
  subtitle: string
  image: React.FC<SvgProps> | any
  isLocked?: boolean
  isSvg?: boolean
}

interface SelectionScreenProps {
  title: string
  description: string
  items: SelectionItem[]
  backgroundImage: ImageSourcePropType
  titleBackgroundImage: ImageSourcePropType
  onBack: () => void
  onSelect: (itemId: string) => void
  showMuteButton?: boolean
  showBackButton?: boolean
  overlayOpacity?: number
  mainImage?: ImageSourcePropType
  ctaButtonText?: string
  buttonBackgroundImage?: ImageSourcePropType
}

const SelectionScreen: React.FC<SelectionScreenProps> = ({
  title,
  description,
  items,
  backgroundImage,
  titleBackgroundImage,
  onBack,
  onSelect,
  showMuteButton = true,
  showBackButton = true,
  overlayOpacity = 0.5,
  mainImage,
  ctaButtonText,
  buttonBackgroundImage,
}) => {
  const [isMuted, setIsMuted] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const handleItemSelect = (itemId: string, isLocked?: boolean) => {
    if (isLocked) return
    setSelectedId(itemId)
    setTimeout(() => {
      onSelect(itemId)
    }, 300)
  }

  return (
    <ImageBackground style={styles.container} source={backgroundImage}>
      <View style={[styles.blackOverlay, { backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})` }]} />

      <View style={styles.header}>
        {showBackButton && (
          <TouchableOpacity onPress={onBack} style={styles.headerButton}>
            <View style={styles.iconBackground}>
              <MaterialIcons name="arrow-back" size={22} color="white" />
            </View>
          </TouchableOpacity>
        )}
        {showMuteButton && (
          <TouchableOpacity onPress={toggleMute} style={styles.headerButton}>
            <View style={styles.iconBackground}>
              <MaterialIcons name={isMuted ? 'volume-off' : 'volume-up'} size={22} color="white" />
            </View>
          </TouchableOpacity>
        )}
      </View>

      <ImageBackground source={titleBackgroundImage} style={styles.titleContainer} resizeMode="contain">
        <Text style={[GameFonts.epic, styles.titleText]}>{title}</Text>
      </ImageBackground>

      <View style={styles.contentContainer}>
        {items.length >= 1 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.itemsContainer}>
            {items.map((item, index) => {
              const ImageComponent = item.image
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.itemCard,
                    selectedId === item.id && styles.itemCardSelected,
                    item.isLocked && styles.itemCardLocked,
                  ]}
                  onPress={() => handleItemSelect(item.id, item.isLocked)}
                  disabled={item.isLocked}
                  activeOpacity={0.8}
                >
                  <View style={styles.itemImageContainer}>
                    {item.isSvg ? (
                      <ImageComponent width={120} height={160} />
                    ) : (
                      <Image source={item.image} style={styles.itemImage} resizeMode="contain" />
                    )}
                    {index === 0 && !item.isLocked && <View style={styles.activeIndicator} />}
                  </View>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
                </TouchableOpacity>
              )
            })}
          </ScrollView>
        ) : (
          <View>
            <Image source={mainImage} style={{ width: 700, height: 500 }} resizeMode="contain" />
          </View>
        )}
      </View>

      <View style={styles.descriptionContainer}>
        <Text style={styles.descriptionText}>{description}</Text>
        {ctaButtonText && (
          <View style={styles.buttonWrapper}>
            <TouchableOpacity style={styles.buttonTouchable}>
              <ImageBackground source={buttonBackgroundImage} style={styles.buttonBackground} resizeMode="contain">
                <Text style={[GameFonts.button, styles.buttonText]}>{ctaButtonText}</Text>
              </ImageBackground>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  blackOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    flexDirection: 'row',
    position: 'absolute',
    width: '100%',
    top: 12,
    left: 5,
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    zIndex: 100,
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBackground: {
    backgroundColor: '#131313',
    borderRadius: 17,
    padding: 6.8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    padding: 8,
    marginTop: 22,
  },
  titleText: {
    fontSize: 16,
    color: '#E0E0E0',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemsContainer: {
    paddingHorizontal: 40,
    alignItems: 'center',
    gap: 24,
  },
  itemCard: {
    alignItems: 'center',
    width: 160,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  itemCardSelected: {
    borderColor: '#C87423',
    backgroundColor: 'rgba(200, 116, 35, 0.2)',
  },
  itemCardLocked: {
    opacity: 0.5,
  },
  itemImageContainer: {
    position: 'relative',
    width: 120,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  activeIndicator: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#cd7f32',
    borderWidth: 2,
    borderColor: 'white',
  },
  itemTitle: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  itemSubtitle: {
    color: '#9CA3AF',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 14,
    paddingHorizontal: 4,
  },
  descriptionContainer: {
    position: 'absolute',
    bottom: 8,
    left: 24,
    right: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    padding: 16,
    borderRadius: 12,
  },
  descriptionText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonTouchable: {
    marginLeft: 16,
  },
  buttonBackground: {
    alignItems: 'center',
    width: 'auto',
    height: 'auto',
    right: -10,
    top: -20,
    position: 'absolute',
    justifyContent: 'center',
    padding: 16,
  },
  buttonText: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
    color: 'black',
  },
  buttonWrapper: {
    flexDirection: 'row',
    position: 'relative',
    alignItems: 'center',
    marginTop: 8,
  },
})

export default SelectionScreen
