import React, { useEffect } from 'react';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Form, Input, message, Modal } from 'antd';

import { TRecipe } from 'types/recipes';
import styles from './ModalCustom.module.scss';
import { uid } from 'uid';
import { db } from 'utils/firebase-config';
import { ref, set, update } from 'firebase/database';

type TModalCustom = {
  modalIsOpen: boolean;
  onClose: () => void;
  recipe?: TRecipe;
  fetchRecipe: () => void;
  scrollToLeft: () => void;
};

const required = [{ required: true, message: 'Is required' }];

export const ModalCustom: React.FC<TModalCustom> = ({
  modalIsOpen = false,
  onClose,
  recipe,
  fetchRecipe,
  scrollToLeft,
}: TModalCustom) => {
  const [form] = Form.useForm();

  useEffect(() => {
    form.resetFields();
  }, [form, recipe]);

  const onRemove =
    (remove: (index: number | number[]) => void, nameInput: number, name: string) => () => {
      if (nameInput === 0) {
        form.getFieldValue(name);
        form.setFieldsValue({ [name]: [''] });
      } else {
        remove(nameInput);
      }
    };

  const resetFormFields = () => {
    form.resetFields();
  };

  const onFinish = (values: TRecipe) => {
    if (recipe?.id) {
      update(ref(db, `recipes/${recipe?.id}`), {
        ...values,
        date: Date.now(),
        title: values.title,
        ingredients: values.ingredients,
        directions: values.directions,
      })
        .then(() => {
          fetchRecipe();
          onClose();
          message.success('Updated recipe');
        })
        .catch((error) => {
          return message.error(error);
        });
    } else {
      const uuid = uid();
      set(ref(db, `recipes/${uuid}`), {
        id: uuid,
        date: Date.now(),
        title: values.title,
        ingredients: values.ingredients,
        directions: values.directions,
      })
        .then(() => {
          fetchRecipe();
          onClose();
          scrollToLeft();
          message.success('Added new recipe');
        })
        .catch((error) => {
          return message.error(error);
        });
    }
  };

  return (
    <Modal
      forceRender
      visible={modalIsOpen}
      onCancel={onClose}
      destroyOnClose
      footer={null}
      afterClose={resetFormFields}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          title: recipe?.title,
          ingredients: recipe?.ingredients || [''],
          directions: recipe?.directions || [''],
        }}
      >
        <div className={styles.formRow}>
          <div className={styles.formTitle}>Title</div>
          <Form.Item name="title" rules={required}>
            <Input />
          </Form.Item>
        </div>
        <div className={styles.formRow}>
          <div className={styles.formTitle}>Ingredients:</div>
          <Form.List name="ingredients">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <div key={key} className={styles.formWrapInput}>
                    <Form.Item
                      {...restField}
                      name={name}
                      rules={required}
                      style={{ marginBottom: 5, width: '100%', paddingRight: '10px' }}
                    >
                      <Input />
                    </Form.Item>
                    <MinusCircleOutlined onClick={onRemove(remove, name, 'ingredients')} />
                  </div>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />}>
                    Add field
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </div>
        <div className={styles.formRow}>
          <div className={styles.formTitle}>Directions:</div>
          <Form.List name="directions">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <div key={key} className={styles.formWrapInput}>
                    <Form.Item
                      {...restField}
                      name={name}
                      rules={required}
                      style={{ marginBottom: 5, width: '100%', paddingRight: '10px' }}
                    >
                      <Input />
                    </Form.Item>
                    <MinusCircleOutlined onClick={onRemove(remove, name, 'directions')} />
                  </div>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />}>
                    Add field
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </div>

        <Form.Item shouldUpdate>
          {() => (
            <Button type="primary" htmlType="submit" disabled={!form.isFieldsTouched()}>
              Submit
            </Button>
          )}
        </Form.Item>
      </Form>
    </Modal>
  );
};
