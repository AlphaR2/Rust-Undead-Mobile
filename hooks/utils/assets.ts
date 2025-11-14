import { Image } from 'expo-image'

type BackgroundImages = {
  layer1: any
  layer2: any
  layer3: any
  layer4: any
  layer5: any
  layer6: any
  layer7: any
}

export const prefetchBackgroundImages = async (images: BackgroundImages): Promise<void> => {
  try {
    await Promise.all([
      Image.prefetch(images.layer1),
      Image.prefetch(images.layer2),
      Image.prefetch(images.layer3),
      Image.prefetch(images.layer4),
      Image.prefetch(images.layer5),
      Image.prefetch(images.layer6),
      Image.prefetch(images.layer7),
    ])
  } catch (error) {
    // Prefetch failure should not break app flow
  }
}