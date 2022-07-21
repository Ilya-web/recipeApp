import React, { ChangeEvent, useCallback, useEffect, useState, useMemo, useRef } from 'react';
import classNames from 'classnames';
import { Button, Input, Spin, message } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import debounce from 'lodash.debounce';
import { get, query, ref, remove } from 'firebase/database';

import { TRecipe } from 'types/recipes';
import { ModalCustom } from 'components/ModalCustom';

import { db } from 'utils/firebase-config';
import styles from './Recipes.module.scss';

export const Recipes: React.FC = () => {
  const [isVisibleModal, setIsVisibleModal] = useState(false);
  const [recipes, setRecipes] = useState<TRecipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<TRecipe>();
  const [isNewRecipe, setIsNewRecipe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDelete, setIsDelete] = useState(false);

  const menu = useRef<HTMLUListElement | null>(null);
  const recipeData = useRef<TRecipe[]>([]);

  const fetchRecipe = useCallback(() => {
    setIsLoading(true);
    const recipesData = query(ref(db, 'recipes'));

    get(recipesData)
      .then((snapshot) => {
        const data = snapshot.val();
        const sortData = Object.values<TRecipe>(data).sort((a, b) => {
          return b.date - a.date;
        });
        setRecipes(sortData);
        recipeData.current = sortData;
        setSelectedRecipe(undefined);
      })
      .catch((error) => {
        return message.error(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchRecipe();
  }, [fetchRecipe]);

  useEffect(() => {
    if (recipes.length && !selectedRecipe) {
      setSelectedRecipe(recipes[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipes]);

  const onSearch = useMemo(
    () =>
      debounce((event: ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value.toLowerCase();
        if (value) {
          const filterRecipes = recipeData.current.filter((item) =>
            item.ingredients.join('').toLowerCase().includes(value),
          );
          setRecipes(filterRecipes);
          setSelectedRecipe(undefined);
        } else {
          fetchRecipe();
        }
      }, 400),
    [fetchRecipe],
  );

  const handleOpenModal = () => {
    setIsVisibleModal(true);
    setIsNewRecipe(false);
  };

  const handleCloseModal = () => {
    setIsVisibleModal(false);
  };

  const handleClickList = (id: number) => () => {
    if (id !== selectedRecipe?.id) {
      const recipe = recipes.find((i) => i.id === id);
      if (recipe) {
        setSelectedRecipe(recipe);
      }
    }
  };

  const handleDelete = () => {
    setIsDelete(true);
    if (selectedRecipe) {
      remove(ref(db, `recipes/${selectedRecipe.id}`))
        .then(() => {
          setRecipes((prev) => {
            return prev.filter((i) => i.id !== selectedRecipe.id);
          });
          setSelectedRecipe(undefined);
          setIsDelete(false);
          message.success('Deleted recipe');
        })
        .catch((error) => {
          return message.error(error);
        });
    }
  };

  const scrollToLeft = useCallback(() => {
    menu.current?.scrollTo({
      left: 0,
      behavior: 'smooth',
    });
  }, []);

  const addNewRecipe = () => {
    setIsNewRecipe(true);
    setIsVisibleModal(true);
  };

  return (
    <Spin spinning={isDelete}>
      <div className={styles.container}>
        <div className={styles.wrapSearch}>
          <Input
            size="large"
            placeholder="Search for ingredients"
            prefix={<SearchOutlined />}
            onChange={onSearch}
          />
        </div>
        <div className={styles.main}>
          <div className={styles.recipesNav}>
            <Spin spinning={isLoading}>
              <ul ref={menu}>
                {recipes &&
                  recipes.map((item) => {
                    return (
                      <li
                        className={classNames({
                          [styles.active]: selectedRecipe?.id === item.id,
                        })}
                        onClick={handleClickList(item.id)}
                        title={item.title}
                        key={item.id}
                      >
                        {item.title}
                      </li>
                    );
                  })}
                <li className={styles.addRecipe}>
                  <Button type="dashed" onClick={addNewRecipe} icon={<PlusOutlined />}>
                    Add recipe
                  </Button>
                </li>
              </ul>
              <div className={styles.addRecipeMobile}>
                <Button type="dashed" onClick={addNewRecipe} icon={<PlusOutlined />}>
                  Add recipe
                </Button>
              </div>
            </Spin>
          </div>
          {!!recipes.length && (
            <div className={styles.recipesDesc}>
              <div className={styles.recipesDescRow}>
                <div className={styles.recipesDescTitle}>Ingredients:</div>
                <ul>
                  {selectedRecipe &&
                    selectedRecipe.ingredients?.map((item, index) => {
                      return <li key={index}>{item}</li>;
                    })}
                </ul>
              </div>
              <div className={styles.recipesDescRow}>
                <div className={styles.recipesDescTitle}>Directions:</div>
                <ul>
                  {selectedRecipe &&
                    selectedRecipe.directions?.map((item, index) => {
                      return <li key={index}>{item}</li>;
                    })}
                </ul>
              </div>
              <div className={styles.recipesDescButtons}>
                <Button type="primary" onClick={handleOpenModal}>
                  Edit
                </Button>
                <Button type="primary" onClick={handleDelete}>
                  Delete
                </Button>
              </div>
              <div className={styles.recipesDate}>
                <span className={styles.recipesDateTitle}>Changed recipe on: </span>
                {selectedRecipe?.date && new Date(selectedRecipe?.date).toLocaleString()}
              </div>
            </div>
          )}
        </div>
      </div>
      <ModalCustom
        modalIsOpen={isVisibleModal}
        onClose={handleCloseModal}
        recipe={isNewRecipe ? undefined : selectedRecipe}
        fetchRecipe={fetchRecipe}
        scrollToLeft={scrollToLeft}
      />
    </Spin>
  );
};
