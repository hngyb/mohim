import React, { FC } from "react";
import Modal from "react-native-modal";

type ColorPalettesModalProps = {
  isColorPalettesModalVisible: boolean;
};

export const ColorPalettesModal: FC<any> = () => {
  return (
    <View>
      <Modal
        isVisible={isColorPalettesModalVisible}
        onSwipeComplete={() => setColorPalettesModalVisible(false)}
        swipeDirection="down"
      >
        <View style={{ flex: 1 }}>
          <Text>I am the modal content!</Text>
          <TouchableView onPress={toggleColorPalettesModal}>
            <Text>onpress</Text>
          </TouchableView>
        </View>
      </Modal>
    </View>
  );
};
