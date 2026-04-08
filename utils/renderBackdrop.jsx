import { BottomSheetBackdrop } from "@gorhom/bottom-sheet";

const renderBackdrop = (props) => (
  <BottomSheetBackdrop
    {...props}
    disappearsOnIndex={-1}
    appearsOnIndex={0}
    pressBehavior="close"
  />
);

export default renderBackdrop;
