import { createContext } from "react";

export type IEditableFieldsContext = {
  editableFields: string[] | null;
  setEditableFields: any;
  refreshEditableFields: any | null;
};

const EditableFieldsContext = createContext<IEditableFieldsContext>({
  editableFields: null,
  setEditableFields: null,
  refreshEditableFields: null,
});
export default EditableFieldsContext;
