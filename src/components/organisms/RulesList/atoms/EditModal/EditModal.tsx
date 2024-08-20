/* eslint-disable max-lines-per-function */
import React, { ReactElement, useState, useEffect } from 'react'
import { Modal, Form, Typography, Select, Input, Radio, Tooltip } from 'antd'
import { QuestionCircleOutlined } from '@ant-design/icons'
import { Plus, TrashSimple } from '@phosphor-icons/react'
import { useSelector } from 'react-redux'
import type { RootState } from 'store/store'
import { filterSgName } from 'utils/filterSgName'
import { isCidrValid } from 'utils/isCidrValid'
import { Spacer, CustomMiddleSwitch, FlexButton } from 'components'
import { Styled } from './styled'

type TEditModalProps<T> = {
  direction: 'Ingress' | 'Egress'
  values: T | boolean
  hide: () => void
  edit: (values: T) => void
  isSg?: boolean
  isFqdn?: boolean
  isCidr?: boolean
  isPorts?: boolean
  isTransport?: boolean
  isIcmp?: boolean
  isTrace?: boolean
  defaultPrioritySome?: string
  isDisabled?: boolean
}

export const EditModal = <T,>({
  direction,
  values,
  hide,
  edit,
  isSg,
  isFqdn,
  isCidr,
  isPorts,
  isTransport,
  isIcmp,
  isTrace,
  defaultPrioritySome,
  isDisabled,
}: TEditModalProps<T>): ReactElement => {
  const [form] = Form.useForm()
  // const sg = Form.useWatch<string>('sg', form)
  // const fqdn = Form.useWatch<string>('fqdn', form)
  // const cidr = Form.useWatch<string>('cidr', form)
  const transport = Form.useWatch<string>('transport', form)
  const IPv = Form.useWatch<string>('IPv', form)
  const types = Form.useWatch<string[]>('types', form)
  const action = Form.useWatch<string>('action', form)
  const sgNames = useSelector((state: RootState) => state.sgNames.sgNames)
  const [isOkButtonDisabled, setIsOkButtonDisabled] = useState<boolean>(true)

  useEffect(() => {
    setIsOkButtonDisabled(
      // (isSg && (!sg || sg === undefined)) ||
      // (isFqdn && (!fqdn || fqdn === undefined)) ||
      // (isCidr && (!cidr || cidr === undefined)) ||
      (isTransport && (!transport || transport === undefined)) ||
        (isIcmp && (!IPv || IPv === undefined || !types || types === undefined || types.length === 0)) ||
        !action ||
        action === undefined,
    )
    // }, [sg, fqdn, cidr, transport, IPv, types, action, isSg, isFqdn, isCidr, isTransport, isIcmp])
  }, [transport, IPv, types, action, isSg, isFqdn, isCidr, isTransport, isIcmp])

  useEffect(() => {
    form.setFieldsValue(values)
  }, [values, form])

  const submit = () => {
    form
      .validateFields()
      .then(() => {
        if (isPorts) {
          const values: T & { ports: { s: string | string[]; d: string | string[] }[] } = form.getFieldsValue()
          const plainPortsValues = {
            ...values,
            ports: values.ports.map(({ s, d }) => ({
              s: Array.isArray(s) ? s.join(',') : s,
              d: Array.isArray(d) ? d.join(',') : d,
            })),
          }
          edit(plainPortsValues)
        } else {
          const values: T = form.getFieldsValue()
          edit(values)
        }
        hide()
      })
      // eslint-disable-next-line no-console
      .catch(err => console.log('Validating error', err))
  }

  return (
    <Modal
      title={`Edit ${direction}`}
      open={typeof values !== 'boolean'}
      onOk={() => submit()}
      onCancel={() => {
        hide()
        form.resetFields()
      }}
      okText="Save"
      okButtonProps={{
        disabled: isOkButtonDisabled,
      }}
    >
      <Spacer $space={16} $samespace />
      <Form form={form}>
        {isSg && (
          <>
            <Typography.Text>
              Security Group<Typography.Text type="danger">*</Typography.Text>
            </Typography.Text>
            <Spacer $space={4} $samespace />
            <Styled.ResetedFormItem
              name="sg"
              hasFeedback
              validateTrigger="onBlur"
              rules={[{ required: true, message: 'Please input SG name' }]}
            >
              <Select
                showSearch
                placeholder="Select security group"
                optionFilterProp="children"
                allowClear
                filterOption={filterSgName}
                options={sgNames.map(el => ({
                  value: el,
                  label: el,
                }))}
                getPopupContainer={node => node.parentNode}
                disabled
              />
            </Styled.ResetedFormItem>
          </>
        )}
        {isFqdn && (
          <>
            <Typography.Text>
              FQDN<Typography.Text type="danger">*</Typography.Text>
            </Typography.Text>
            <Spacer $space={4} $samespace />
            <Styled.ResetedFormItem
              name="fqdn"
              hasFeedback
              validateTrigger="onBlur"
              rules={[
                { required: true, message: 'Missing FQDN' },
                {
                  pattern:
                    /(?=^.{1,253}$)(^(((?!-)[a-zA-Z0-9-]{1,63}(?<!-))|((?!-)[a-zA-Z0-9-]{1,63}(?<!-)\.)+[a-zA-Z]{2,63})$)/,
                  message: 'Please enter a valid FQDN',
                },
              ]}
            >
              <Input placeholder="Enter FQDN" disabled />
            </Styled.ResetedFormItem>
          </>
        )}
        {isCidr && (
          <>
            <Typography.Text>
              CIDR<Typography.Text type="danger">*</Typography.Text>
            </Typography.Text>
            <Spacer $space={4} $samespace />
            <Styled.ResetedFormItem
              name="cidr"
              hasFeedback
              validateTrigger="onBlur"
              rules={[
                { required: true, message: 'Missing CIDR' },
                () => ({
                  validator(_, value: string) {
                    if (isCidrValid(value)) {
                      return Promise.resolve()
                    }
                    return Promise.reject(new Error('Please enter valid type'))
                  },
                }),
              ]}
            >
              <Input placeholder="Enter CIDR" disabled />
            </Styled.ResetedFormItem>
          </>
        )}
        <Spacer $space={16} $samespace />
        <Typography.Text>Priority</Typography.Text>
        <Spacer $space={4} $samespace />
        <Styled.ResetedFormItem
          name="prioritySome"
          hasFeedback
          validateTrigger="onBlur"
          rules={[
            {
              pattern: /^[-0-9]*$/,
              message: 'Please enter a valid priority',
            },
            () => ({
              validator(_, value: string) {
                if (value === undefined) {
                  return Promise.resolve()
                }
                const numberedValue = Number(value)
                if (Number.isNaN(numberedValue) || numberedValue > 32767 || numberedValue < -32768) {
                  return Promise.reject(new Error('Not in valid range'))
                }
                return Promise.resolve()
              },
            }),
          ]}
        >
          <Input placeholder={defaultPrioritySome || 'From -32768 to 32767'} />
        </Styled.ResetedFormItem>
        {(isTransport || isIcmp) && (
          <>
            <Spacer $space={16} $samespace />
            <Typography.Text>
              Transport<Typography.Text type="danger">*</Typography.Text>
            </Typography.Text>
            <Spacer $space={4} $samespace />
            <Styled.ResetedFormItem
              name="transport"
              hasFeedback
              validateTrigger="onBlur"
              rules={[{ required: true, message: 'Please choose transport' }]}
            >
              <Radio.Group>
                <Radio value="TCP" disabled={isIcmp}>
                  TCP
                </Radio>
                <Radio value="UDP" disabled={isIcmp}>
                  UDP
                </Radio>
                <Radio value="ICMP" checked={isIcmp} disabled={!isIcmp}>
                  ICMP
                </Radio>
              </Radio.Group>
            </Styled.ResetedFormItem>
          </>
        )}
        {isPorts && (
          <>
            <Spacer $space={16} $samespace />
            <Typography.Text>
              Ports{' '}
              <Tooltip title="Enter ports from 1 to 65535. You can specify a range (e.g., 1-9999) or use the symbol (*) for all ports.">
                <QuestionCircleOutlined size={16} />
              </Tooltip>
            </Typography.Text>
            <Spacer $space={4} $samespace />
            <Styled.PortsEditContainer>
              <Styled.CustomLabelsContainer>
                <Typography.Text>Source</Typography.Text>
                <Typography.Text>Destination</Typography.Text>
              </Styled.CustomLabelsContainer>
              <Form.List name="ports">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <Styled.PortFormItemsContainer key={key}>
                        <Styled.ResetedFormItem {...restField} name={[name, 's']}>
                          <Select
                            mode="tags"
                            showSearch
                            placeholder="Enter port, range, or *"
                            optionFilterProp="children"
                            allowClear
                            tokenSeparators={[',', ' ']}
                            getPopupContainer={node => node.parentNode}
                            suffixIcon={null}
                            dropdownStyle={{ display: 'none' }}
                            maxTagCount="responsive"
                          />
                        </Styled.ResetedFormItem>
                        <Styled.ResetedFormItem {...restField} name={[name, 'd']}>
                          <Select
                            mode="tags"
                            showSearch
                            placeholder="Enter port, range, or *"
                            optionFilterProp="children"
                            allowClear
                            tokenSeparators={[',', ' ']}
                            getPopupContainer={node => node.parentNode}
                            suffixIcon={null}
                            dropdownStyle={{ display: 'none' }}
                            maxTagCount="responsive"
                          />
                        </Styled.ResetedFormItem>
                        <FlexButton type="text" onClick={() => remove(name)} block icon={<TrashSimple size={18} />} />
                      </Styled.PortFormItemsContainer>
                    ))}
                    <Styled.ResetedFormItem>
                      <FlexButton type="dashed" onClick={() => add()} block icon={<Plus size={24} />}>
                        Add more
                      </FlexButton>
                    </Styled.ResetedFormItem>
                  </>
                )}
              </Form.List>
            </Styled.PortsEditContainer>
          </>
        )}
        {isIcmp && (
          <>
            <Spacer $space={16} $samespace />
            <Typography.Text>
              IPv<Typography.Text type="danger">*</Typography.Text>
            </Typography.Text>
            <Spacer $space={4} $samespace />
            <Styled.ResetedFormItem
              name="IPv"
              hasFeedback
              validateTrigger="onBlur"
              rules={[{ required: true, message: 'Please choose IPv' }]}
            >
              <Radio.Group>
                <Radio value="IPv6">IPv6</Radio>
                <Radio value="IPv4">IPv4</Radio>
              </Radio.Group>
            </Styled.ResetedFormItem>
            <Spacer $space={16} $samespace />
            <Typography.Text>
              Types<Typography.Text type="danger">*</Typography.Text>{' '}
              <Tooltip title="Separator: space / coma">
                <QuestionCircleOutlined size={16} />
              </Tooltip>
            </Typography.Text>
            <Spacer $space={4} $samespace />
            <Styled.ResetedFormItem
              name="types"
              // tooltip="Separator: space / coma"
              rules={[
                { required: true, message: 'Please choose type' },
                () => ({
                  validator(_, value: string[]) {
                    if (value.some(el => /^\b(?:1\d{2}|2[0-4]\d|[1-9]?\d|25[0-5])\b$/.test(el) === false)) {
                      return Promise.reject(new Error('Please enter valid type'))
                    }
                    return Promise.resolve()
                  },
                }),
              ]}
            >
              <Select
                mode="tags"
                showSearch
                placeholder="Select types"
                optionFilterProp="children"
                allowClear
                tokenSeparators={[',', ' ']}
                getPopupContainer={node => node.parentNode}
                disabled={isDisabled}
                suffixIcon={null}
                // dropdownStyle={{ display: 'none' }}
                maxTagCount="responsive"
              />
            </Styled.ResetedFormItem>
          </>
        )}
        <Spacer $space={16} $samespace />
        <Typography.Text>
          Action<Typography.Text type="danger">*</Typography.Text>
        </Typography.Text>
        <Spacer $space={4} $samespace />
        <Styled.ResetedFormItem
          name="action"
          hasFeedback
          validateTrigger="onBlur"
          rules={[{ required: true, message: 'Please choose action' }]}
        >
          <Radio.Group>
            <Radio value="DROP">DROP</Radio>
            <Radio value="ACCEPT">ACCEPT</Radio>
          </Radio.Group>
        </Styled.ResetedFormItem>
        <Spacer $space={16} $samespace />
        <Styled.ResetedFormItem valuePropName="checked" name="logs" label="Logs" colon={false}>
          <CustomMiddleSwitch />
        </Styled.ResetedFormItem>
        {isTrace && (
          <>
            <Spacer $space={16} $samespace />
            <Styled.ResetedFormItem valuePropName="checked" name="trace" label="Trace" colon={false}>
              <CustomMiddleSwitch />
            </Styled.ResetedFormItem>
          </>
        )}
      </Form>
    </Modal>
  )
}
