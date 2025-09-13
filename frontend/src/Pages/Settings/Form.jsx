import React, { useContext, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import schema from './schema';
// Services
import { updatePreferences } from '../../services/users';
// Context
import AuthContext from '../../context/AuthContext';
// Styles
import '../../Styles/crud.css';
// Hooks
import useAuthRedirect from '../../hooks/useAuthRedirect';
// Components
import { LoadingButton } from '@/Components/LoadingButton';

export default function SettingsForm() {
  const { user, updateUserLocal } = useContext(AuthContext);
  useAuthRedirect(user);
  const title = 'Settings';

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      weight: user?.weightUnit || 'g',
      volume: user?.volumeUnit || 'l',
      color: (user?.colorUnit || 'EBC').toUpperCase(),
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        weight: user.weightUnit || 'g',
        volume: user.volumeUnit || 'l',
        color: (user.colorUnit || 'EBC').toUpperCase(),
      });
    }
  }, [user, reset]);

  const onValid = async (data) => {
    const weight = (data.weight || 'g').toLowerCase();
    const volume = (data.volume || 'l').toLowerCase();
    const color = String(data.color || 'EBC').toUpperCase();

    console.log('Submitting:', { weight, volume, color });

    await updatePreferences(user.token, {
      weightUnit: weight,
      volumeUnit: volume,
      colorUnit: color,
    });

    updateUserLocal({ weightUnit: weight, volumeUnit: volume, colorUnit: color });
    reset({ weight, volume, color });
  };

  return (
    <div className="crud-container">
      <section>
        <h1>{title}</h1>
      </section>
      <div className="content">
        <form id="formSubmit" onSubmit={handleSubmit(onValid)}>

          {/* Weight */}
          <div className="inputs-row">
            <div className="input-field">
              <label className="block mb-2 font-medium">Weight Unit</label>
              <div className="radio-toggle">
                {[{ value: "g", label: "Grams" }, { value: "oz", label: "Oz" }].map(opt => (
                  <label key={opt.value} className="radio-toggle-option">
                    <input
                      type="radio"
                      value={opt.value}
                      {...register("weight")}
                      className="hidden"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Volume */}
          <div className="inputs-row">
            <div className="input-field">
              <label className="block mb-2 font-medium">Volume Unit</label>
              <div className="radio-toggle">
                {[{ value: "l", label: "Liters" }, { value: "gal", label: "Gallons" }].map(opt => (
                  <label key={opt.value} className="radio-toggle-option">
                    <input
                      type="radio"
                      value={opt.value}
                      {...register("volume")}
                      className="hidden"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Color */}
          <div className="inputs-row">
            <div className="input-field">
              <label className="block mb-2 font-medium">Color Unit</label>
              <div className="color-toggle">
                {["EBC", "SRM"].map(opt => (
                  <label key={opt} className="radio-toggle-option">
                    <input
                      type="radio"
                      value={opt}
                      {...register("color")}
                      className="hidden"
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </form>
      </div>
        <LoadingButton
          form="formSubmit"
          type="submit"
          loading={isSubmitting}
          disabled={isSubmitting}
          className="crud-save-button"
        >
          {isSubmitting ? 'Saving…' : 'Save'}
        </LoadingButton>
    </div>
  );
}
