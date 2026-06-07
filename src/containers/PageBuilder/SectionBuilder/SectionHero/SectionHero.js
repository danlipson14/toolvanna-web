import React from 'react';
import classNames from 'classnames';

import Field, { hasDataInFields } from '../../Field';

import SectionContainer from '../SectionContainer';
import css from './SectionHero.module.css';

/**
 * @typedef {Object} FieldComponentConfig
 * @property {ReactNode} component
 * @property {Function} pickValidProps
 */

/**
 * Section component for a website's hero section
 * The Section Hero doesn't have any Blocks by default, all the configurations are made in the Section Hero settings
 *
 * @component
 * @param {Object} props
 * @param {string?} props.className add more style rules in addition to components own css.root
 * @param {string?} props.rootClassName overwrite components own css.root
 * @param {Object} props.defaultClasses
 * @param {string} props.defaultClasses.sectionDetails
 * @param {string} props.defaultClasses.title
 * @param {string} props.defaultClasses.description
 * @param {string} props.defaultClasses.ctaButton
 * @param {string} props.sectionId id of the section
 * @param {'hero'} props.sectionType
 * @param {Object?} props.title
 * @param {Object?} props.description
 * @param {Object?} props.appearance
 * @param {Object?} props.callToAction
 * @param {Object} props.options extra options for the section component (e.g. custom fieldComponents)
 * @param {Object<string,FieldComponentConfig>?} props.options.fieldComponents custom fields
 * @returns {JSX.Element} Section for article content
 */
const SectionHero = props => {
  const {
    sectionId,
    className,
    rootClassName,
    defaultClasses,
    title,
    description,
    appearance,
    callToAction,
    options,
  } = props;

  // If external mapping has been included for fields
  // E.g. { h1: { component: MyAwesomeHeader } }
  const fieldComponents = options?.fieldComponents;
  const fieldOptions = { fieldComponents };

  const hasHeaderFields = hasDataInFields([title, description, callToAction], fieldOptions);

  return (
  <SectionContainer
    id={sectionId}
    className={className}
    rootClassName={classNames(rootClassName || css.root)}
    
    options={fieldOptions}
  >
    <section className={css.hero}>
      <div className={css.overlay}></div>

      <div className={css.heroContent}>
        <div className={css.leftSide}>
          <h1 className={css.heroTitle}>
            Turn Your Tools
            <br />
            Into <span>Cash. Fast.</span>
          </h1>

          <p className={css.heroSubtitle}>
            Search your tool. Choose its condition. We create the listing.
            If it doesn't sell in 72 hours, we buy it.
          </p>

          <div className={css.heroButtons}>
            <a href="/s" className={css.sellButton}>
              Sell a Tool
            </a>

            <a href="/search" className={css.browseButton}>
              Browse Tools
            </a>
          </div>
        </div>

        <div className={css.rightSide}>
  <div className={css.sellCard}>

    <div className={css.sellBadge}>
      LIST A TOOL
    </div>

    <h3 className={css.sellTitle}>
      Sell In Seconds
    </h3>

    <p className={css.sellText}>
      Search your tool, choose condition, and we'll create the listing.
    </p>

    <div className={css.fakeSearch}>
      Search model or SKU...
    </div>

    <div className={css.conditionRow}>
      <div className={css.conditionBtn}>New</div>
      <div className={`${css.conditionBtn} ${css.activeCondition}`}>
        Used Good
      </div>
      <div className={css.conditionBtn}>Fair</div>
    </div>

    <div className={css.infoGrid}>
      <div className={css.infoCard}>
        <div className={css.infoNumber}>72 hrs</div>
        <div className={css.infoText}>Market access</div>
      </div>

      <div className={css.infoCard}>
        <div className={css.infoNumber}>We buy it</div>
        <div className={css.infoText}>If it doesn't sell</div>
      </div>
    </div>

      <a href="/s" className={css.sellNowBtn}>
      Sell My Tool →
    </a>

  </div>
</div>

</div>

</section>
</SectionContainer>
);
};

export default SectionHero;
