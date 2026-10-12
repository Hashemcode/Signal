/* ===== Topics, notes and the question bank ===== */
const ORIG = __ORIG__;
const LOGO = '__LOGO__';

const TOPICS = [
  { id: 'nv', n: 'The nervous system', plate: 'I', col: 'tc-nv', lab: 'neuro', blurb: 'Neurones, synapses and the brain',
    notes: ['A <b>stimulus</b> is a change in the environment. <b>Receptors</b> detect it and <b>effectors</b> (muscles and glands) respond.',
      'The <b>CNS</b> is the brain and spinal cord. The <b>PNS</b> is all the nerves outside them.',
      'Three neurone types: <b>sensory</b> (receptor to CNS), <b>relay</b> (inside the CNS) and <b>motor</b> (CNS to effector).',
      'An impulse is <b>electrical</b> along a neurone and <b>chemical</b> across a synapse (neurotransmitter).',
      'The <b>myelin sheath</b> is fatty insulation that speeds up the impulse.',
      '<b>Cerebrum</b>: thinking, memory, language. <b>Cerebellum</b>: balance and coordination. <b>Medulla</b>: heart rate and breathing.'],
    terms: [['Stimulus', 'A change in the environment that is detected'], ['Receptor', 'Detects a stimulus'], ['Effector', 'A muscle or gland that produces a response'], ['Synapse', 'The gap between two neurones'], ['Neurotransmitter', 'Chemical that crosses the synapse'], ['Myelin sheath', 'Fatty insulation that speeds up impulses'], ['Nerve', 'A bundle of neurones']] },
  { id: 'rf', n: 'Reflex arc', plate: 'II', col: 'tc-rf', lab: 'reflex', blurb: 'Fast, automatic, protective responses',
    notes: ['A <b>reflex</b> is fast, automatic and protective. It does not involve conscious thought.',
      'The path: stimulus, receptor, <b>sensory neurone</b>, <b>relay neurone</b> (spinal cord), <b>motor neurone</b>, effector, response.',
      'Reflexes are fast because the pathway is <b>short</b>, has <b>few synapses</b> and skips the conscious part of the brain.',
      'A <b>voluntary</b> action uses the cerebrum, so it is slower.',
      'Your brain is told <b>afterwards</b>. That is why you feel the pain after you have already pulled your hand away.'],
    terms: [['Reflex action', 'Fast, automatic, protective'], ['Reflex arc', 'The pathway of a reflex'], ['Voluntary action', 'A response you choose to make'], ['Relay neurone', 'Links sensory and motor neurones in the CNS']] },
  { id: 'ey', n: 'The eye', plate: 'III', col: 'tc-ey', lab: 'eye', blurb: 'Pupil reflex and focusing',
    notes: ['The <b>cornea</b> and <b>lens</b> refract light. The lens changes shape to focus (<b>accommodation</b>).',
      'The <b>retina</b> holds the receptors. <b>Rods</b> work in dim light. <b>Cones</b> detect colour in bright light. The <b>optic nerve</b> carries impulses to the brain.',
      '<b>Bright light:</b> circular muscles contract, radial muscles relax, the pupil gets smaller.',
      '<b>Dim light:</b> radial muscles contract, circular muscles relax, the pupil gets larger.',
      '<b>Near object:</b> ciliary muscles contract, suspensory ligaments slacken, lens fatter. <b>Distant object:</b> ciliary muscles relax, ligaments tighten, lens thinner.',
      'The image on the retina is upside down. The brain turns it the right way up.'],
    terms: [['Cornea', 'Clear front layer that refracts light'], ['Iris', 'Controls the size of the pupil'], ['Pupil', 'Hole in the centre of the iris'], ['Retina', 'Light-sensitive layer with rods and cones'], ['Ciliary muscle', 'Changes the shape of the lens'], ['Suspensory ligaments', 'Hold the lens in place'], ['Accommodation', 'Focusing on different distances']] },
  { id: 'hm', n: 'Hormones', plate: 'IV', col: 'tc-hm', lab: 'glucose', blurb: 'Insulin, adrenaline and feedback',
    notes: ['<b>Hormones</b> are chemical messengers made in glands. They travel in the <b>blood</b> and act on <b>target organs</b>.',
      'Compared with nerves, hormones are <b>slower</b> and their effects <b>last longer</b>.',
      '<b>Adrenaline</b> (adrenal glands): raises heart rate and blood glucose for fight or flight.',
      '<b>Insulin</b> (pancreas) lowers blood glucose by turning glucose into glycogen in the liver. <b>Glucagon</b> raises it.',
      '<b>Negative feedback</b> reverses a change to keep conditions constant.',
      '<b>Type 1 diabetes:</b> the pancreas makes too little insulin. It is treated with insulin injections and a controlled diet.'],
    terms: [['Hormone', 'Chemical messenger carried in the blood'], ['Gland', 'An organ that makes hormones'], ['Insulin', 'Lowers blood glucose'], ['Glucagon', 'Raises blood glucose'], ['Adrenaline', 'Fight or flight hormone'], ['ADH', 'Controls water balance in the kidneys'], ['Negative feedback', 'A change triggers a response that reverses it']] },
  { id: 'pl', n: 'Plant responses', plate: 'V', col: 'tc-pl', lab: 'plant', blurb: 'Tropisms and auxin',
    notes: ['A <b>tropism</b> is a growth response to a direction. <b>Positive</b> means towards, <b>negative</b> means away.',
      '<b>Auxin</b> is made in the shoot and root tips. It moves to the <b>shaded</b> side (light) or the <b>lower</b> side (gravity).',
      'In <b>shoots</b>, auxin makes cells elongate. In <b>roots</b>, a high auxin level slows elongation.',
      'Shoots: positive <b>phototropism</b>, negative <b>geotropism</b>. Roots: positive geotropism, positive hydrotropism.',
      'The <b>tip</b> detects the stimulus. Remove or cover the tip and the bending stops.',
      'Plants have no nervous system, so their responses are slower than animals.'],
    terms: [['Tropism', 'Growth response to a direction'], ['Phototropism', 'Response to light'], ['Geotropism', 'Response to gravity'], ['Hydrotropism', 'Response to water'], ['Auxin', 'Plant growth hormone'], ['Elongation', 'Cells getting longer']] }
];
const TOPIC_IDX = Object.fromEntries(TOPICS.map((t, i) => [t.id, i]));

/* ----- helpers for authoring ----- */
const tidy = s => String(s).replace(/ — /g, '. ').replace(/\. ([a-z])/g, (m, c) => '. ' + c.toUpperCase());
const pt = (label, ...rx) => ({ label, rx });      // mark point: any regex hit gives the mark
const BANK = [];
let _n = {};
const add = (t, o) => { const k = TOPICS[t].id + o.type; _n[k] = (_n[k] || 0) + 1; BANK.push({ id: k + _n[k], t, ...o }); };

/* ----- 1. original bank (kept, IDs added, dashes removed) ----- */
ORIG.forEach((st, t) => {
  st.mcq.forEach(q => add(t, { type: 'mcq', q: q[0], a: q[1], w: q.slice(2, 5), why: tidy(q[5]) }));
  st.tf.forEach(q => add(t, { type: 'tf', q: q[0], a: !!q[1], why: tidy(q[2]) }));
});
const PAIRSETS = [
  [0, [['Receptor', 'Detects a stimulus'], ['Effector', 'Muscle or gland that responds'], ['Sensory neurone', 'Carries impulses to the CNS'], ['Motor neurone', 'Carries impulses to an effector']]],
  [0, [['Relay neurone', 'Links neurones inside the CNS'], ['Synapse', 'Gap between two neurones'], ['CNS', 'Brain and spinal cord'], ['Neurotransmitter', 'Chemical that crosses a synapse']]],
  [0, [['Dendrite', 'Receives impulses'], ['Axon', 'Carries impulses away'], ['Myelin sheath', 'Insulates and speeds impulses'], ['Cerebellum', 'Balance and coordination']]],
  [1, [['Reflex action', 'Fast, automatic, protective'], ['Voluntary action', 'Needs conscious thought'], ['Relay neurone', 'Found in the spinal cord'], ['Effector', 'Muscle or gland that responds']]],
  [1, [['Stimulus', 'A change that is detected'], ['Receptor', 'Detects the stimulus'], ['Sensory neurone', 'Carries impulses to the CNS'], ['Motor neurone', 'Carries impulses to the muscle']]],
  [2, [['Cornea', 'Clear front layer that refracts light'], ['Iris', 'Controls pupil size'], ['Retina', 'Contains rods and cones'], ['Optic nerve', 'Carries impulses to the brain']]],
  [2, [['Lens', 'Changes shape to focus light'], ['Sclera', 'Tough white outer layer'], ['Ciliary muscle', 'Alters the shape of the lens'], ['Suspensory ligaments', 'Hold the lens in place']]],
  [3, [['Insulin', 'Lowers blood glucose'], ['Glucagon', 'Raises blood glucose'], ['Adrenaline', 'Fight or flight'], ['ADH', 'Water balance in the kidneys']]],
  [3, [['Pancreas', 'Makes insulin and glucagon'], ['Adrenal gland', 'Sits on top of the kidney'], ['Pituitary', 'The master gland'], ['Thyroid', 'Controls metabolic rate']]],
  [4, [['Phototropism', 'Response to light'], ['Geotropism', 'Response to gravity'], ['Hydrotropism', 'Response to water'], ['Thigmotropism', 'Response to touch']]],
  [4, [['Auxin', 'Plant growth hormone'], ['Shoot tip', 'Detects light and makes auxin'], ['Positive tropism', 'Growth towards the stimulus'], ['Negative tropism', 'Growth away from the stimulus']]]
];
PAIRSETS.forEach(([t, pairs]) => add(t, { type: 'match', q: 'Match each term with its job.', pairs, why: 'Check any you missed and try again later.' }));

const SORTS = [
  [3, 'Is each statement about the nervous system or the hormonal system?', ['Nervous', 'Hormonal'], [['Blinking when something nears your eye', 0], ['Pupil narrowing in bright light', 0], ['Impulses travelling along neurones', 0], ['A very fast response', 0], ['Insulin released after a meal', 1], ['Adrenaline released when frightened', 1], ['Message carried in the blood', 1], ['Effects last longer', 1]]],
  [3, 'Is each statement about the nervous system or the hormonal system?', ['Nervous', 'Hormonal'], [['Uses neurones', 0], ['Controls a knee-jerk', 0], ['Short-lived effect', 0], ['Pulling your hand from a hot pan', 0], ['Controls growth and puberty', 1], ['Uses glands', 1], ['Insulin and glucagon', 1], ['Made by endocrine glands', 1]]],
  [3, 'Does each statement describe insulin or glucagon?', ['Insulin', 'Glucagon'], [['Lowers blood glucose', 0], ['Turns glucose into glycogen', 0], ['Released when glucose is high', 0], ['Missing in type 1 diabetes', 0], ['Raises blood glucose', 1], ['Turns glycogen into glucose', 1], ['Released when glucose is low', 1], ['Made in the pancreas, like insulin', 1]]],
  [1, 'Is each action a reflex or a voluntary action?', ['Reflex', 'Voluntary'], [['Blinking at a flying insect', 0], ['Knee-jerk', 0], ['Pupil narrowing in bright light', 0], ['Pulling away from a hot pan', 0], ['Writing your name', 1], ['Choosing a snack', 1], ['Kicking a ball', 1], ['Answering a question', 1]]],
  [0, 'Which part of the nervous system is each item in?', ['CNS', 'PNS'], [['Brain', 0], ['Spinal cord', 0], ['Relay neurone', 0], ['Cerebellum', 0], ['Nerve to the leg muscle', 1], ['Sensory neurone in the arm', 1], ['Motor neurone to the hand', 1], ['Nerves from the skin', 1]]],
  [2, 'Is each statement about rod cells or cone cells?', ['Rods', 'Cones'], [['Work in dim light', 0], ['Do not detect colour', 0], ['Most numerous towards the edge of the retina', 0], ['Very sensitive to light', 0], ['Detect colour', 1], ['Need bright light', 1], ['Packed into the fovea', 1], ['Three types: red, green, blue', 1]]],
  [2, 'Does each change happen in bright light or dim light?', ['Bright light', 'Dim light'], [['Pupil gets smaller', 0], ['Circular muscles contract', 0], ['Radial muscles relax', 0], ['Less light enters the eye', 0], ['Pupil gets larger', 1], ['Radial muscles contract', 1], ['Circular muscles relax', 1], ['More light enters the eye', 1]]],
  [2, 'Does each change happen when focusing on a near or a distant object?', ['Near object', 'Distant object'], [['Ciliary muscles contract', 0], ['Suspensory ligaments slacken', 0], ['Lens becomes fatter', 0], ['Light is bent more', 0], ['Ciliary muscles relax', 1], ['Suspensory ligaments are pulled tight', 1], ['Lens becomes thinner', 1], ['Light is bent less', 1]]],
  [4, 'Does each statement describe a shoot or a root?', ['Shoot', 'Root'], [['Positive phototropism', 0], ['Negative geotropism', 0], ['Auxin makes cells elongate', 0], ['Grows up, away from gravity', 0], ['Positive geotropism', 1], ['Positive hydrotropism', 1], ['High auxin slows elongation', 1], ['Grows down into the soil', 1]]]
];
SORTS.forEach(([t, q, cats, items]) => add(t, { type: 'sort', q, cats, items, why: 'Review your notes for the ones you missed.' }));

const ORDERS = [
  [1, 'Put the steps of a reflex arc in order.', ['Stimulus', 'Receptor', 'Sensory neurone', 'Relay neurone', 'Motor neurone', 'Effector', 'Response'], 'The impulse goes: ' + 'stimulus, receptor, sensory neurone, relay neurone, motor neurone, effector, response.'],
  [0, 'Put these synapse steps in order.', ['Impulse reaches the axon terminal', 'Vesicles release neurotransmitter', 'Neurotransmitter diffuses across the synapse', 'It binds to receptors on the next neurone', 'A new impulse starts'], 'Electrical, then chemical, then electrical again.'],
  [2, 'Put the pupil reflex in bright light in order.', ['Bright light hits the retina', 'Receptors send impulses along the sensory neurone', 'The CNS sends impulses along motor neurones', 'Circular muscles in the iris contract', 'The pupil gets smaller'], 'It is a reflex, so no conscious decision is needed.'],
  [2, 'Put the steps of focusing on a near object in order.', ['Light comes from a near object', 'Ciliary muscles contract', 'Suspensory ligaments slacken', 'The lens becomes fatter', 'Light is focused on the retina'], 'A fatter lens bends light more.'],
  [3, 'Put the negative feedback steps after a meal in order.', ['Blood glucose rises', 'The pancreas detects the rise', 'Insulin is released into the blood', 'The liver turns glucose into glycogen', 'Blood glucose falls back to normal'], 'Negative feedback reverses the change.'],
  [4, 'Put the phototropism steps in order.', ['Light shines from one side', 'The shoot tip detects the light', 'Auxin moves to the shaded side', 'Shaded cells elongate more', 'The shoot bends towards the light'], 'Auxin moves, cells elongate, shoot bends.']
];
ORDERS.forEach(([t, q, steps, why]) => add(t, { type: 'order', q, steps, why }));

/* ----- label questions: [topic, diagram, part, prompt, why] ----- */
[
  [2, 'eye', 'retina', 'Tap the layer that contains rods and cones.', 'The retina holds the light receptors.'],
  [2, 'eye', 'iris', 'Tap the part that changes the size of the pupil.', 'The iris has circular and radial muscles.'],
  [2, 'eye', 'lens', 'Tap the part that changes shape to focus light.', 'The lens becomes fatter or thinner.'],
  [2, 'eye', 'cornea', 'Tap the clear front part that refracts light first.', 'The cornea does most of the refraction.'],
  [2, 'eye', 'optic', 'Tap the structure that carries impulses to the brain.', 'The optic nerve is a bundle of sensory neurones.'],
  [2, 'eye', 'lig', 'Tap the suspensory ligaments.', 'They connect the lens to the ciliary muscle.'],
  [2, 'eye', 'cil', 'Tap the muscle that alters the shape of the lens.', 'This is the ciliary muscle.'],
  [2, 'eye', 'pupil', 'Tap the pupil.', 'The pupil is the hole in the centre of the iris.'],
  [2, 'eye', 'sclera', 'Tap the tough white outer layer.', 'The sclera protects the eyeball.'],
  [0, 'neurone', 'dend', 'Tap the part that receives impulses.', 'Dendrites receive impulses from other cells.'],
  [0, 'neurone', 'axon', 'Tap the long fibre that carries the impulse away from the cell body.', 'This is the axon.'],
  [0, 'neurone', 'myelin', 'Tap the fatty insulation that speeds up the impulse.', 'This is the myelin sheath.'],
  [0, 'neurone', 'term', 'Tap where neurotransmitter is released.', 'The axon terminals release it into the synapse.'],
  [0, 'neurone', 'nuc', 'Tap the nucleus.', 'The nucleus controls the cell.'],
  [0, 'brain', 'cerebellum', 'Tap the part of the brain that coordinates balance and movement.', 'This is the cerebellum.'],
  [0, 'brain', 'medulla', 'Tap the part that controls breathing and heart rate.', 'This is the medulla.'],
  [0, 'brain', 'cerebrum', 'Tap the part used for thinking, memory and language.', 'This is the cerebrum.'],
  [1, 'arc', 'sens', 'Tap the neurone that carries the impulse into the spinal cord.', 'This is the sensory neurone.'],
  [1, 'arc', 'relay', 'Tap the relay neurone.', 'It links the sensory and motor neurones inside the spinal cord.'],
  [1, 'arc', 'motor', 'Tap the neurone that carries the impulse to the muscle.', 'This is the motor neurone.'],
  [1, 'arc', 'rec', 'Tap the receptor.', 'Receptors in the skin detect the stimulus.'],
  [1, 'arc', 'eff', 'Tap the effector.', 'The muscle contracts to pull the hand away.'],
  [3, 'gland', 'panc', 'Tap the organ that makes insulin.', 'The pancreas makes insulin and glucagon.'],
  [3, 'gland', 'adr', 'Tap the adrenal gland.', 'It sits on top of the kidney and makes adrenaline.'],
  [3, 'gland', 'pit', 'Tap the master gland.', 'The pituitary gland is at the base of the brain.'],
  [3, 'gland', 'thy', 'Tap the gland in the neck that controls metabolism.', 'This is the thyroid gland.']
].forEach(([t, d, part, q, why]) => add(t, { type: 'label', diagram: d, part, q, why }));

/* ----- data questions (mcq with a figure) ----- */
[
  [3, { kind: 'line', xl: 'Time after meal (min)', yl: 'Blood glucose (mmol/dm3)', xs: [0, 30, 60, 90, 120, 150, 180], series: [{ n: 'Healthy', y: [5, 6.6, 7.8, 6.9, 5.8, 5.2, 5] }], band: [4, 8] },
    'Look at the graph. Between which times is insulin lowering the blood glucose?', '60 to 120 minutes', ['0 to 30 minutes', '150 to 180 minutes', 'Insulin is not involved'], 'Glucose falls from its peak as insulin acts, then levels off.'],
  [3, { kind: 'line', xl: 'Time after meal (min)', yl: 'Blood glucose (mmol/dm3)', xs: [0, 30, 60, 90, 120, 150, 180], series: [{ n: 'Healthy', y: [5, 6.6, 7.8, 6.9, 5.8, 5.2, 5] }, { n: 'Type 1, untreated', y: [5.5, 10, 13.5, 16, 17, 17, 16.5] }], band: [4, 8] },
    'What does the graph show about the person with untreated type 1 diabetes?', 'Blood glucose rises much higher and stays high', ['Blood glucose falls below normal', 'Blood glucose stays the same as the healthy person', 'Blood glucose rises then returns to normal in 60 minutes'], 'Without insulin, glucose is not removed from the blood.'],
  [3, { kind: 'line', xl: 'Time after a scare (s)', yl: 'Heart rate (beats/min)', xs: [0, 10, 20, 30, 60, 120, 180, 300], series: [{ n: 'Heart rate', y: [70, 70, 105, 120, 115, 100, 85, 72] }] },
    'About how long did the heart rate take to return close to resting?', 'About 5 minutes', ['About 10 seconds', 'About 30 seconds', 'It never returned'], 'Adrenaline effects last for minutes, longer than a nerve impulse.'],
  [2, { kind: 'line', xl: 'Light intensity (units)', yl: 'Pupil diameter (mm)', xs: [0, 1, 2, 3, 4, 5], series: [{ n: 'Pupil', y: [8, 7, 5.5, 4, 3, 2.5] }] },
    'Describe the pattern shown by the data.', 'As light intensity increases, pupil diameter decreases', ['As light intensity increases, pupil diameter increases', 'Pupil diameter stays the same', 'Pupil diameter is largest in bright light'], 'The iris muscles shrink the pupil to protect the retina.'],
  [1, { kind: 'bar', yl: 'Response time (s)', cats: ['Knee jerk', 'Catch a falling ruler', 'Press a button when told to'], series: [{ n: 'Time', y: [0.05, 0.2, 0.35] }] },
    'Which action is most likely to be a reflex?', 'Knee jerk', ['Catch a falling ruler', 'Press a button when told to', 'They are all reflexes'], 'The shortest time means the shortest pathway and no conscious decision.'],
  [4, { kind: 'bar', yl: 'Mean cell length (micrometres)', cats: ['Lit side', 'Shaded side'], series: [{ n: 'Length', y: [40, 65] }] },
    'A shoot was lit from one side. What do the results show?', 'Cells on the shaded side elongated more, so the shoot bent towards the light', ['Cells on the lit side elongated more', 'Both sides elongated equally', 'Auxin collected on the lit side'], 'Auxin moves to the shaded side and makes those cells longer.']
].forEach(([t, fig, q, a, w, why]) => add(t, { type: 'mcq', fig, q, a, w, why }));

/* ----- extra MCQ/TF to deepen the bank ----- */
[
  [0, 'A person cannot feel touch on their hand but can move it. Which neurone is most likely damaged?', 'Sensory neurone', ['Motor neurone', 'Effector', 'Cerebellum'], 'Sensory neurones carry the touch signal to the CNS.'],
  [0, 'Which statement about hormones and nerve impulses is correct?', 'Impulses are faster than hormones', ['Hormones are faster than impulses', 'Both travel in blood', 'Hormones are electrical'], 'Nerves act in milliseconds. Hormones need blood transport.'],
  [1, 'Which sequence is correct for a reflex arc?', 'Receptor, sensory neurone, relay neurone, motor neurone, effector', ['Receptor, motor neurone, relay neurone, sensory neurone, effector', 'Effector, motor neurone, relay neurone, sensory neurone, receptor', 'Receptor, relay neurone, sensory neurone, effector, motor neurone'], 'Always follow the impulse from stimulus to response.'],
  [1, 'You step on a pin. Which happens first?', 'Receptors in your foot detect the pain', ['Your brain decides to lift your foot', 'The muscle contracts', 'Your relay neurone fires'], 'Every reflex starts with a receptor detecting a stimulus.'],
  [2, 'Which cells give you vision at night?', 'Rods', ['Cones', 'Iris cells', 'Cornea cells'], 'Rods are sensitive to dim light but do not detect colour.'],
  [2, 'When you walk from bright sunlight into a dark room, what happens to your pupils?', 'They get larger', ['They get smaller', 'They stay the same', 'They change colour'], 'Radial muscles contract to let in more light.'],
  [3, 'Which gland would you target to treat a person whose blood glucose stays too high?', 'Pancreas', ['Thyroid', 'Pituitary', 'Adrenal'], 'The pancreas makes insulin.'],
  [3, 'Why do the effects of adrenaline last longer than a reflex?', 'It is carried in the blood and breaks down slowly', ['It travels along neurones', 'It only reaches the brain', 'It is stored in muscle'], 'Hormones are slow to act and slow to clear.'],
  [4, 'A potted plant is placed on its side. After a few days its shoot has curved upwards. This is…', 'Negative geotropism', ['Positive geotropism', 'Positive phototropism', 'Hydrotropism'], 'Auxin collects on the lower side and lengthens those cells.'],
  [4, 'A seedling is grown on a rotating clinostat in one-sided light. Why does it grow straight?', 'Auxin is spread evenly because the light direction keeps changing', ['It cannot make auxin', 'The tip was removed', 'It does not respond to light'], 'Without a steady direction, the auxin does not collect on one side.']
].forEach(([t, q, a, w, why]) => add(t, { type: 'mcq', q, a, w, why }));
[
  [0, 'Receptors are found only in the eye.', false, 'Receptors are everywhere: skin, tongue, nose, ears, muscles.'],
  [1, 'You feel the pain from a reflex before your hand moves.', false, 'The hand moves first. The brain learns about it afterwards.'],
  [2, 'The image formed on the retina is the right way up.', false, 'It is upside down. The brain corrects it.'],
  [2, 'To see a near object, the lens becomes thinner.', false, 'The lens becomes fatter to bend light more.'],
  [3, 'Glucagon causes glycogen to be turned into glucose.', true, 'Glucagon raises blood glucose.'],
  [4, 'Roots show negative geotropism.', false, 'Roots show positive geotropism.']
].forEach(([t, q, a, why]) => add(t, { type: 'tf', q, a, why }));

/* ----- explain questions (typed answer, marked against mark points) ----- */
[
  [0, 'Describe how an impulse passes across a synapse.', [
    pt('A chemical (neurotransmitter) is released from the end of the first neurone', 'transmitter', 'chemical', 'vesicle'),
    pt('It diffuses across the gap', 'diffus', '(cross|across|move|travel).{0,25}(gap|synapse)', '(gap|synapse).{0,25}(cross|across)'),
    pt('It binds to receptors on the next neurone and starts a new impulse', 'receptor', 'bind', 'new (nerve )?impulse', 'triggers?')],
    'Neurotransmitter is released from vesicles, diffuses across the synapse, binds to receptors on the next neurone and starts a new impulse.'],
  [0, 'Name the three types of neurone and state what each one does.', [
    pt('Sensory neurones carry impulses from receptors to the CNS', 'sensory.{0,80}(cns|brain|spinal|central|towards)', 'receptor.{0,40}(cns|brain|spinal)'),
    pt('Relay neurones link neurones inside the CNS', 'relay.{0,80}(link|connect|inside|within|between|cns|spinal|brain)'),
    pt('Motor neurones carry impulses from the CNS to effectors', 'motor.{0,80}(effector|muscle|gland|away|from the (cns|brain|spinal))')],
    'Sensory: receptor to CNS. Relay: inside the CNS, linking sensory and motor. Motor: CNS to effector (muscle or gland).'],
  [1, 'Explain why a reflex action is faster than a voluntary action.', [
    pt('The pathway is shorter, going through the spinal cord', 'short', 'spinal cord', 'fewer neurones', 'direct'),
    pt('There are fewer synapses', 'fewer synapse', 'less synapse', 'fewer (neurone|connection)'),
    pt('It does not involve conscious thought or the brain deciding', 'conscious', 'think', 'decid', 'automatic', 'bypass', 'without (the )?brain', 'not (the )?brain')],
    'Short pathway through the spinal cord, few synapses, and no time spent on conscious decision-making.'],
  [1, 'Describe the pathway taken by an impulse when you touch something hot and pull your hand away.', [
    pt('Receptors in the skin detect the heat', 'receptor'),
    pt('A sensory neurone carries the impulse to the spinal cord', 'sensory'),
    pt('A relay neurone passes it on inside the spinal cord (CNS)', 'relay'),
    pt('A motor neurone carries it to the muscle (effector), which contracts', 'motor.{0,60}(muscle|effector)', 'effector', 'muscle.{0,20}contract')],
    'Receptor, sensory neurone, relay neurone in the spinal cord, motor neurone, effector muscle contracts.'],
  [1, 'Give two reasons why reflex actions are important.', [
    pt('They protect the body from harm or damage', 'protect', 'harm', 'damage', 'danger', 'injur'),
    pt('They are fast or automatic, so there is no delay', 'fast', 'quick', 'automatic', 'immediate', 'no (need to )?think')],
    'They are fast and protective.'],
  [2, 'Explain how the eye responds when you walk from a dark room into bright sunlight.', [
    pt('Circular muscles in the iris contract', 'circular.{0,40}contract', 'contract.{0,40}circular'),
    pt('Radial muscles relax', 'radial.{0,40}relax', 'relax.{0,40}radial'),
    pt('The pupil gets smaller', 'pupil.{0,30}(smaller|constrict|narrow|decrease)', '(smaller|constrict|narrow).{0,15}pupil'),
    pt('Less light enters, which protects the retina', 'less light', 'protect', 'damage')],
    'Circular muscles contract, radial muscles relax, the pupil gets smaller and less light reaches the retina, protecting it.'],
  [2, 'Describe how the eye focuses on a near object.', [
    pt('Ciliary muscles contract', 'ciliary.{0,40}contract', 'contract.{0,40}ciliary'),
    pt('Suspensory ligaments slacken (loosen)', 'ligament.{0,40}(slack|loose|relax)', '(slack|loose).{0,30}ligament'),
    pt('The lens becomes fatter (more curved)', '(fat|thick|round|curv|short).{0,20}lens', 'lens.{0,40}(fat|thick|round|curv|short)'),
    pt('Light is refracted (bent) more and focused on the retina', 'refract', 'bent|bend', 'focus.{0,30}retina')],
    'Ciliary muscles contract, ligaments slacken, lens becomes fatter, light is bent more and focuses on the retina.'],
  [2, 'Compare rod cells and cone cells.', [
    pt('Rods work in dim light', 'rod.{0,60}(dim|low|dark|night)', '(dim|low|dark|night).{0,40}rod'),
    pt('Cones detect colour in bright light', 'cone.{0,60}(colou?r|bright)', '(colou?r|bright).{0,40}cone')],
    'Rods: dim light, no colour. Cones: bright light, colour.'],
  [3, 'Compare nervous and hormonal coordination.', [
    pt('Nerves use electrical impulses. Hormones are chemicals carried in the blood', 'electric', 'impulse', 'blood'),
    pt('Nervous responses are faster', 'nerv.{0,60}(fast|quick)', '(fast|quick).{0,40}nerv', 'hormon.{0,60}slow', 'slow.{0,40}hormon'),
    pt('Hormone effects last longer and may reach many organs', 'long(er)?[ -]?(lasting|term|last)', 'last.{0,10}longer', 'widespread', 'many (organ|part)')],
    'Nervous: electrical, fast, short-lived, precise. Hormonal: chemical in blood, slower, long-lasting, wider.'],
  [3, 'Explain how the body brings blood glucose down after a meal.', [
    pt('The pancreas detects the rise and releases insulin', 'pancreas', 'insulin'),
    pt('The liver turns glucose into glycogen (cells take up glucose)', 'glycogen', 'liver', 'cells? (take|absorb|use)'),
    pt('Blood glucose falls back to normal', 'fall', 'drop', 'decrease', 'lower', 'normal', 'reduc'),
    pt('This is negative feedback', 'negative feedback')],
    'Pancreas releases insulin, liver converts glucose to glycogen, glucose falls. This is negative feedback.'],
  [3, 'Explain why a person with type 1 diabetes needs insulin injections.', [
    pt('Their pancreas does not make enough insulin', 'pancreas', 'not (make|produce)', 'doesn.?t (make|produce)', 'cannot (make|produce)', 'lack', 'no insulin'),
    pt('Insulin lowers blood glucose, so it stops glucose getting too high', 'lower', 'reduce', 'decrease', 'too high', 'control', 'glucose')],
    'The pancreas makes too little insulin, so glucose would stay too high.'],
  [3, 'Describe three effects of adrenaline on the body.', [
    pt('Heart rate increases', 'heart.{0,30}(rate|beat|fast|increase)', 'pulse'),
    pt('Breathing rate increases or pupils dilate', 'breath', 'pupil', 'dilat'),
    pt('Blood glucose rises (more energy for muscles)', 'glucose', 'sugar', 'energy', 'glycogen')],
    'Heart rate up, breathing faster, pupils wider, blood glucose up.'],
  [4, 'Explain why a shoot bends towards a light source.', [
    pt('The tip detects the light and makes auxin', 'tip', 'detect'),
    pt('Auxin moves to the shaded side', 'auxin.{0,50}shad', 'shad.{0,50}auxin', 'away from (the )?light'),
    pt('Cells on the shaded side elongate more', 'elongat', 'longer', 'grow (faster|more)'),
    pt('So the shoot bends towards the light', 'bend', 'curve', 'toward')],
    'The tip detects light, auxin moves to the shaded side, those cells elongate more and the shoot bends towards the light.'],
  [4, 'A shoot tip is covered with foil and light shines from one side. Predict what happens and explain.', [
    pt('The shoot grows straight up (no bending)', 'straight', 'upright', 'no bend', 'does not bend', 'doesn.?t bend', 'not bend'),
    pt('The tip cannot detect the light', 'tip.{0,40}(cannot|can.?t|not|unable)', '(cannot|can.?t|unable|not).{0,25}detect', 'covered'),
    pt('Auxin is spread evenly, so both sides elongate equally', 'even', 'equal', 'same')],
    'It grows straight because the tip cannot detect the light, so auxin stays evenly spread.'],
  [4, 'Explain why roots grow downwards.', [
    pt('Roots show positive geotropism (respond to gravity)', 'geotrop', 'gravity'),
    pt('Auxin collects on the lower side', 'lower', 'bottom', 'under'),
    pt('High auxin slows elongation in roots, so the upper side grows more and the root bends down', 'inhibit', 'slow', 'less', 'upper.{0,30}(grow|elongat)')],
    'Gravity makes auxin collect on the lower side. In roots, this slows growth, so the upper cells elongate more and the root bends down.']
].forEach(([t, q, points, model]) => add(t, { type: 'explain', q, points, marks: points.length, model }));

/* ----- case files (story, then steps built from the same question types) ----- */
const CASES = [
  { id: 'c1', t: 1, title: 'The hot pan', story: 'Dana grabs a pan handle and pulls her hand away before she even feels the heat.',
    steps: [{ type: 'mcq', q: 'Which structures detected the heat?', a: 'Receptors in the skin', w: ['Effectors in the muscle', 'The cerebrum', 'Relay neurones'], why: 'Every reflex starts with receptors.' },
      { type: 'label', diagram: 'arc', part: 'sens', q: 'Tap the neurone that carried the impulse into the spinal cord.', why: 'The sensory neurone goes towards the CNS.' },
      { type: 'order', q: 'Put the path of the impulse in order.', steps: ['Receptor', 'Sensory neurone', 'Relay neurone', 'Motor neurone', 'Effector'], why: 'Receptor to effector.' },
      { type: 'mcq', q: 'Why did she pull away before feeling the pain?', a: 'The reflex pathway skips the conscious brain', w: ['Her muscles decided on their own', 'Hormones acted first', 'The pain signal was blocked'], why: 'The brain is informed afterwards.' }],
    verdict: 'Healthy reflex arc. The response was automatic, fast and protective.' },
  { id: 'c2', t: 0, title: 'The silent hand', story: 'After a sports injury, Leen can feel a warm cup in her hand but cannot move her fingers.',
    steps: [{ type: 'mcq', q: 'Which type of neurone is most likely damaged?', a: 'Motor neurone', w: ['Sensory neurone', 'Relay neurone', 'Receptor'], why: 'She can still feel, so sensory neurones work. The signal to the muscle is failing.' },
      { type: 'mcq', q: 'What does that neurone normally do?', a: 'Carries impulses from the CNS to the muscle', w: ['Carries impulses from the skin to the CNS', 'Links neurones inside the spinal cord', 'Detects the warmth'], why: 'Motor neurones go to effectors.' },
      { type: 'tf', q: 'Her muscles are the effectors in this response.', a: true, why: 'Muscles contract to move the fingers.' }],
    verdict: 'Damage to the motor pathway. Sensation is normal, movement is lost.' },
  { id: 'c3', t: 0, title: 'No feeling at all', story: 'Noor touches a hot surface. She feels nothing and her hand stays where it is.',
    steps: [{ type: 'mcq', q: 'Which neurone type is most likely damaged?', a: 'Sensory neurone', w: ['Motor neurone', 'Cerebellum', 'Effector muscle'], why: 'The signal never reached the CNS.' },
      { type: 'mcq', q: 'Why does her hand not move away?', a: 'The impulse cannot reach the spinal cord, so no reflex is triggered', w: ['Her muscles are too weak', 'Her hormones are missing', 'Her brain chose to stay'], why: 'No sensory impulse means no reflex.' },
      { type: 'explain', q: 'Describe where the impulse would normally travel after the receptor.', points: [pt('Along the sensory neurone to the spinal cord', 'sensory'), pt('Through a relay neurone', 'relay'), pt('Out along a motor neurone to the muscle', 'motor')], marks: 3, model: 'Sensory neurone, relay neurone, motor neurone to the muscle.' }],
    verdict: 'Sensory pathway broken. No feeling and no reflex.' },
  { id: 'c4', t: 0, title: 'The unsteady walker', story: 'Hiba has had a head injury. She understands everything and speaks clearly, but she wobbles when she walks and misses when she reaches for objects.',
    steps: [{ type: 'label', diagram: 'brain', part: 'cerebellum', q: 'Tap the part of the brain most likely damaged.', why: 'The cerebellum coordinates balance and movement.' },
      { type: 'mcq', q: 'Why is her speech and thinking normal?', a: 'The cerebrum is not damaged', w: ['The medulla controls speech', 'The spinal cord thinks for her', 'Hormones control speech'], why: 'The cerebrum handles language, memory and thinking.' },
      { type: 'mcq', q: 'Which part keeps her heart beating and breathing normally?', a: 'Medulla', w: ['Cerebellum', 'Cerebrum', 'Pituitary'], why: 'The medulla controls vital automatic functions.' }],
    verdict: 'Cerebellum damage. Balance and coordination are affected.' },
  { id: 'c5', t: 2, title: 'Out of the cinema', story: 'Zainab walks from a dark cinema into bright sunshine. She squints, then sees normally after a few seconds.',
    steps: [{ type: 'mcq', q: 'What happened to her pupils?', a: 'They got smaller', w: ['They got larger', 'They stayed the same', 'They moved apart'], why: 'Less light must enter.' },
      { type: 'sort', q: 'Which muscles changed?', cats: ['Contract', 'Relax'], items: [['Circular muscles of the iris', 0], ['Radial muscles of the iris', 1]], why: 'Circular muscles contract and radial muscles relax in bright light.' },
      { type: 'mcq', q: 'Why is this response useful?', a: 'It protects the retina from damage', w: ['It helps hearing', 'It focuses near objects', 'It makes tears'], why: 'Too much light can damage receptors.' },
      { type: 'tf', q: 'The pupil reflex needs conscious thought.', a: false, why: 'It is a reflex.' }],
    verdict: 'Normal pupil reflex.' },
  { id: 'c6', t: 2, title: 'Eyes up from the book', story: 'Maya looks up from her book to a poster across the room. Everything is blurry for a moment, then sharp.',
    steps: [{ type: 'order', q: 'Put the changes in order as she focuses on the distant poster.', steps: ['Ciliary muscles relax', 'Suspensory ligaments pull tight', 'The lens becomes thinner', 'Light is focused on the retina'], why: 'The opposite of near focus.' },
      { type: 'mcq', q: 'What is this process called?', a: 'Accommodation', w: ['Dilation', 'Reflection', 'Adaptation'], why: 'Accommodation is focusing at different distances.' },
      { type: 'label', diagram: 'eye', part: 'lens', q: 'Tap the part that changed shape.', why: 'The lens.' }],
    verdict: 'Accommodation worked correctly.' },
  { id: 'c7', t: 3, title: 'The car horn', story: 'A car horn blares. Noura jumps at once. Five minutes later her heart is still pounding.',
    steps: [{ type: 'mcq', q: 'Which system caused the instant jump?', a: 'Nervous system', w: ['Hormonal system', 'Digestive system', 'Skeletal system'], why: 'Impulses act in milliseconds.' },
      { type: 'mcq', q: 'Which hormone is keeping her heart rate up?', a: 'Adrenaline', w: ['Insulin', 'Glucagon', 'ADH'], why: 'Adrenaline prepares the body for fight or flight.' },
      { type: 'label', diagram: 'gland', part: 'adr', q: 'Tap the gland that released it.', why: 'The adrenal glands sit on top of the kidneys.' },
      { type: 'mcq', q: 'Why does the effect last so long?', a: 'Hormones are carried in the blood and break down slowly', w: ['Neurones fire more slowly', 'The brain keeps sending impulses', 'The heart stores adrenaline'], why: 'Slower, but longer lasting.' }],
    verdict: 'Nerves gave the fast reaction. Hormones gave the lasting one.' },
  { id: 'c8', t: 3, title: 'Sugary drink', story: 'Hala drinks a large sugary drink. Her friend Rana has untreated type 1 diabetes and drinks the same one.',
    steps: [{ type: 'label', diagram: 'gland', part: 'panc', q: 'Tap the organ that detects Hala’s glucose rise.', why: 'The pancreas.' },
      { type: 'mcq', q: 'What does the hormone do in Hala?', a: 'Lowers blood glucose by turning it into glycogen in the liver', w: ['Raises heart rate', 'Controls water balance', 'Raises blood glucose'], why: 'Insulin.' },
      { type: 'mcq', q: 'What happens to Rana’s blood glucose?', a: 'It rises very high and stays high', w: ['It falls quickly', 'It returns to normal', 'It stays the same'], why: 'No insulin, no control.' },
      { type: 'mcq', q: 'How is type 1 diabetes treated?', a: 'Insulin injections and diet control', w: ['Adrenaline injections', 'Glucagon only', 'Removing the liver'], why: 'Replacing the missing insulin.' }],
    verdict: 'Healthy negative feedback in Hala. Missing insulin in Rana.' },
  { id: 'c9', t: 4, title: 'The window plant', story: 'Reem notices her bean seedling is leaning towards the window. She turns the pot around. A few days later it bends back.',
    steps: [{ type: 'mcq', q: 'What is this response called?', a: 'Phototropism', w: ['Geotropism', 'Hydrotropism', 'Photosynthesis'], why: 'A growth response to light.' },
      { type: 'mcq', q: 'Which hormone controls it?', a: 'Auxin', w: ['Insulin', 'Adrenaline', 'ADH'], why: 'Auxin.' },
      { type: 'mcq', q: 'Where does the auxin collect when light comes from the window?', a: 'On the shaded side', w: ['On the lit side', 'In the roots only', 'In the leaves only'], why: 'Shaded cells elongate more.' },
      { type: 'tf', q: 'This is a positive tropism.', a: true, why: 'Growth is towards the stimulus.' }],
    verdict: 'Normal positive phototropism driven by auxin.' },
  { id: 'c10', t: 4, title: 'After the storm', story: 'A storm lays a seedling on its side. Within days the shoot curves upwards and the root curves downwards.',
    steps: [{ type: 'mcq', q: 'What is the stimulus?', a: 'Gravity', w: ['Light', 'Water', 'Touch'], why: 'Geotropism.' },
      { type: 'sort', q: 'Classify each response.', cats: ['Positive geotropism', 'Negative geotropism'], items: [['Shoot growing up', 1], ['Root growing down', 0]], why: 'Roots grow towards gravity, shoots away.' },
      { type: 'explain', q: 'Explain why the root bends down.', points: [pt('Auxin collects on the lower side', 'lower', 'bottom', 'under'), pt('High auxin slows elongation in roots', 'inhibit', 'slow', 'less'), pt('The upper side elongates more, so the root bends down', 'upper', 'bend', 'down')], marks: 3, model: 'Auxin collects on the lower side and slows growth there. The upper cells elongate more, so the root bends downwards.' }],
    verdict: 'Shoot negative geotropism, root positive geotropism.' }
];
CASES.forEach(c => c.steps.forEach((s, i) => { s.id = c.id + 's' + i; s.t = c.t }));
