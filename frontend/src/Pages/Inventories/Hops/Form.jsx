import React, { useEffect, useContext, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import schema from './schema';

import useAuthRedirect from '../../../hooks/useAuthRedirect';
import useFormMode from '../../../hooks/useFormMode';

// Components
import { LoadingButton } from '@/Components/LoadingButton';
import HelpHint from "@/Components/HelpHint";

import { fetchHopById, updateHop, addHop } from '../../../services/hops';
import { showErrorToast } from '../../../utils/notifications';
import getFormTitle from '../../../utils/formTitle';

import AuthContext from '../../../context/AuthContext';

import '../../../Styles/crud.css';
import '../../../Styles/skeleton.css';

export default function NewHop() {
  const { user } = useContext(AuthContext);
  const { id } = useParams();
  const navigate = useNavigate();

  const { isEditing, isView } = useFormMode();
  const [isLoading, setIsLoading] = useState(!!id);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      supplier: '',
      description: '',
      countryOfOrigin: '',
      type: 'Pellet',
      useType: 'Boil',
      alphaAcidContent: '',
      betaAcidContent: '',
    },
  });

  // =======================
  // useEffects
  // =======================
  useAuthRedirect(user);

  useEffect(() => {
    const loadHop = async () => {
      if (!id) { setIsLoading(false); return; }

      try {
        setIsLoading(true);
        const hop = await fetchHopById(user.token, id);
        reset({
          name: hop.name || '',
          supplier: hop.supplier || '',
          description: hop.description || '',
          countryOfOrigin: hop.countryOfOrigin || '',
          type: hop.type || 'Pellet',
          useType: hop.useType || 'Boil',
          alphaAcidContent: hop.alphaAcidContent ?? '',
          betaAcidContent: hop.betaAcidContent ?? '',
        });
      } catch {
        navigate('/HopList');
      } finally {
        setIsLoading(false);
      }
    };

    loadHop();
  }, [id, user, navigate, reset]);

  const title = getFormTitle('Hop', isEditing, isView);

  const onValid = async (data) => {
    const payload = {
      ...data,
    };

    try {
      if (isEditing) {
        await updateHop(user.token, id, payload);
      } else {
        await addHop(user.token, payload);
      }
      navigate('/HopList');
    } catch (err) {
      //
    }
  };

  const onError = (errors) => {
    const firstError = Object.values(errors)[0];
    if (firstError?.message) {
      showErrorToast(firstError.message);
    }
  };

  return (
    <div>
      <div className="crud-container">
        <section>
          <h1>{title}</h1>
        </section>
        <div className="content" aria-busy={isLoading}>
          {isLoading ? (
            <div className="sk sk-card" style={{ padding: 16 }}>
              <div className="inputs-row">
                <div className="input-field" style={{ width: 430 }}>
                  <div className="sk-line w60" style={{ height: 12, marginBottom: 8 }} />
                  <div className="sk-line w80" style={{ height: 36 }} />
                </div>
                <div className="input-field" style={{ flex: 1 }}>
                  <div className="sk-line w40" style={{ height: 12, marginBottom: 8 }} />
                  <div className="sk-line w80" style={{ height: 36 }} />
                </div>
              </div>

              <div className="inputs-row" style={{ marginTop: 16 }}>
                <div className="input-field" style={{ width: '100%' }}>
                  <div className="sk-line w40" style={{ height: 12, marginBottom: 8 }} />
                  <div className="sk-line w80" style={{ height: 90 }} />
                </div>
              </div>

              <div className="inputs-row" style={{ marginTop: 16 }}>
                <div className="input-field" style={{ width: 260 }}>
                  <div className="sk-line w40" style={{ height: 12, marginBottom: 8 }} />
                  <div className="sk-line w80" style={{ height: 36 }} />
                </div>
                <div className="input-field" style={{ width: 220 }}>
                  <div className="sk-line w40" style={{ height: 12, marginBottom: 8 }} />
                  <div className="sk-line w80" style={{ height: 36 }} />
                </div>
                <div className="input-field" style={{ width: 220 }}>
                  <div className="sk-line w40" style={{ height: 12, marginBottom: 8 }} />
                  <div className="sk-line w80" style={{ height: 36 }} />
                </div>
                <div className="input-field" style={{ width: 220 }}>
                  <div className="sk-line w40" style={{ height: 12, marginBottom: 8 }} />
                  <div className="sk-line w80" style={{ height: 36 }} />
                </div>
                <div className="input-field" style={{ width: 220 }}>
                  <div className="sk-line w40" style={{ height: 12, marginBottom: 8 }} />
                  <div className="sk-line w80" style={{ height: 36 }} />
                </div>
              </div>
            </div>
          ) : (
            <form id="formSubmit" onSubmit={handleSubmit(onValid, onError)}>
              <div className="inputs-row">
                <div className="input-field">
                  <label>
                    Name
                    <input
                      {...register('name')}
                      disabled={isView}
                      style={{ width: '430px' }}
                    />
                  </label>
                </div>
                <div className="input-field">
                  <label>
                    Supplier
                    <input
                      {...register('supplier')}
                      disabled={isView}
                    />
                  </label>
                </div>
              </div>

              <div className="inputs-row">
                <div className="input-field" style={{ width: '100%' }}>
                  <label>
                    Description
                    <textarea
                      {...register('description')}
                      disabled={isView}
                    />
                  </label>
                </div>
              </div>

              <div className="inputs-row">
                <div className="input-field">
                  <label>
                    Country of Origin
                    <input
                      {...register('countryOfOrigin')}
                      disabled={isView}
                    />
                  </label>
                </div>

                <div className="input-field">
                  <label>
                    Type
                    <select
                      {...register('type')}
                      disabled={isView}
                    >
                      <option value="Pellet">Pellet</option>
                      <option value="Whole">Whole</option>
                      <option value="Cryo">Cryo</option>
                      <option value="CO2 Extract">CO2 Extract</option>
                    </select>
                  </label>
                </div>

                <div className="input-field">
                  <label>
                    Use Type
                    <select
                      {...register('useType')}
                      disabled={isView}
                    >
                      <option value="Aroma">Aroma</option>
                      <option value="Bittering">Bittering</option>
                      <option value="Dual-purpose">Dual-purpose</option>
                    </select>
                  </label>
                </div>

                <div className="input-field">
                  <label>
                    Alpha Acid
                    <HelpHint text="Alpha acids are the main bittering compounds in hops. 
                                    Their percentage indicates the hop’s potential to add bitterness to the beer during the boil." />
                    <input
                      type="number"
                      step="any"
                      {...register('alphaAcidContent')}
                      disabled={isView}
                    />
                  </label>
                </div>

                <div className="input-field">
                  <label>
                    Beta Acid
                    <HelpHint text="Beta acids are secondary hop compounds that contribute to bitterness and flavor stability, 
                                    but less predictably than alpha acids." />
                    <input
                      type="number"
                      step="any"
                      {...register('betaAcidContent')}
                      disabled={isView}
                    />
                  </label>
                </div>
              </div>
            </form>
          )}
        </div>
        {!isView && !isLoading && (
          <LoadingButton
            form="formSubmit"
            type="submit"
            loading={isSubmitting}
            disabled={isSubmitting}
            className="crud-save-button"
          >
            {isSubmitting ? 'Saving…' : 'Save'}
          </LoadingButton>
        )}
      </div>
    </div>
  );
}
