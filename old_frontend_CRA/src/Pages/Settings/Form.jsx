import React, { useContext, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import schema from './schema';
import { updateUser } from '../../services/users';
import AuthContext from '../../context/AuthContext';
import '../../Styles/crud.css';

import useAuthRedirect from '../../hooks/useAuthRedirect';

export default function SettingsForm() {
  const { user, updateUserLocal } = useContext(AuthContext);
  useAuthRedirect(user);
  const title = 'Settings';

  console.log('AuthContext.user:', user);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      weight: user?.weightUnit || 'g',
    },
  });

  useEffect(() => {
    if (user) {
      reset({ weight: user.weightUnit || 'g' });
    }
  }, [user, reset]);

  const onValid = async (data) => {
    const weight = (data.weight || 'g').toLowerCase();
    await updateUser(user.token, user.user_id, { weightUnit: weight });
    updateUserLocal({ weightUnit: weight });
    reset({ weight });
  };

  return (
    <div className="crud-container">
      <section>
        <h1>{title}</h1>
      </section>
      <div className="content">
        <form id="formSubmit" onSubmit={handleSubmit(onValid)}>
          <div className="inputs-row">
            <div className="input-field">
              <label htmlFor="weight">Weight Unit</label>
              <select id="weight" {...register('weight')}>
                <option value="oz">oz</option>
                <option value="g">g</option>
              </select>
              {errors.weight && <span className="error-message">{errors.weight.message}</span>}
            </div>
          </div>
        </form>
      </div>
      <button form="formSubmit" type="submit" className="crud-save-button" style={{ marginTop: '32px' }}>
        Save
      </button>
    </div>
  );
}
