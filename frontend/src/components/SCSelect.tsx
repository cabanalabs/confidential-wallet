import {Group, Select} from "@mantine/core";

type SelectModel = {
  label: string;
  value: string;
  iconUrl?: string;
};

type Props = {
  defaultValue?: string;
  model: SelectModel[];
  onChange?: (val: string) => void
  value?: string;
}

export const SCSelect = ({model, onChange, value}: Props) => {

  const renderSelectOption = ({ option }) => (
    <Group flex="1" gap="xs">
      <img src={option.iconUrl} width={24} height={24}/>
      {option.label}
    </Group>
  );

  return (
    <Select
      disabled={true}
      onChange={onChange}
      value={value}
      data={model}
      renderOption={renderSelectOption}
  />);
}