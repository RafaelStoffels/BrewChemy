function getFormTitle(entityName, isEditing, isView) {
  if (isEditing) return `Update ${entityName}`;
  if (isView) return `${entityName} Details`;
  return `Add New ${entityName}`;
}

export default getFormTitle;
