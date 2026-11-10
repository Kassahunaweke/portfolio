// ALL TEXT for the Geostatistics learning tool (/learn/geostatistics).
//
// To fix a word or sentence: edit it here, save, and publish as usual.
// - Keep the key names (left of the colon) exactly as they are.
// - Keep anything in {curly braces} — the page fills those in with numbers.
// - <b>...</b> makes text bold.
//
// The Amharic (am) text is a DRAFT and needs review by a native speaker.
// Technical terms are written in Amharic letters with the English word in brackets.

export type Lang = "en" | "am";

export const text = {
  en: {
    pageTitle: "Geostatistics, visually",
    intro:
      "Geostatistics is the science of estimating values at places we have <b>not</b> measured, using the places we <b>have</b>. Here you will explore it with imaginary wells that measure how deep the groundwater is.",
    newWells: "New wells",
    legendTitle: "Depth to water",
    legendShallow: "shallow",
    legendDeep: "deep",
    mathTitle: "The math",
    inWords: "In words",
    tryIt: "Try it",
    km: "km",

    l1Title: "1. Things close together are similar",
    l1Plain:
      "Wells that are close to each other usually have similar water depths. Wells that are far apart can be very different. This simple idea is the heart of geostatistics.",
    l1Try:
      "Click a well. Lines connect it to its 3 nearest and 3 farthest neighbours. Click an empty spot to drill a new well.",
    l1Plot:
      "Each dot is one pair: the selected well and one other well.",
    l1Readout:
      "The 3 nearest wells differ by <b>{near} m</b> on average. The 3 farthest differ by <b>{far} m</b>.",
    l1Exception:
      "This well is an exception! “Usually” does not mean “always”. Try a few other wells.",
    l1Nearest: "3 nearest",
    l1Farthest: "3 farthest",
    l1h: "the distance between two wells",
    l1xy: "a well's position on the map (east, north)",
    l1z: "the water depth measured at a well",
    l1dz: "how different the two wells are",

    l2Title: "2. The variogram: how different, at each distance?",
    l2Plain:
      "Now look at <b>every</b> pair of wells at once. We group the pairs by distance and, for each group, calculate how different the wells typically are. Plotting that against distance gives a curve called the <b>variogram</b>.",
    l2Try:
      "Move the slider to choose a distance band. The map shows the pairs of wells that fall in that band.",
    l2Cloud: "Show every pair (the “variogram cloud”)",
    l2Band: "Distance band",
    l2Readout:
      "<b>{n} pairs</b> are between {a} and {b} km apart. Their average γ is <b>{g} m²</b>.",
    l2Notice:
      "Notice how γ grows with distance and then levels off. Beyond a certain distance, wells no longer tell us anything about each other.",
    l2gamma: "the variogram at distance h: how different wells that far apart typically are",
    l2N: "the number of pairs in that distance band",
    l2diff: "the difference between the two wells in one pair, squared so that big differences count more",
    l2half: "a convention, which is why it is also called the semi-variogram",

    l3Title: "3. Variogram models: drawing a smooth curve",
    l3Plain:
      "The dots from step 2 are bumpy. To make maps later, we need a smooth curve that follows them. Geostatisticians use a few standard shapes, each controlled by three numbers.",
    l3Try:
      "Move the sliders until the curve follows the dots, or press “Fit automatically”. Then try the other shapes.",
    l3Model: "Shape",
    l3Spherical: "Spherical",
    l3Exponential: "Exponential",
    l3Gaussian: "Gaussian",
    l3Nugget: "Nugget",
    l3Sill: "Sill",
    l3Range: "Range",
    l3NuggetHelp: "the jump at zero distance: measurement error and very small-scale variation",
    l3SillHelp: "the level where the curve flattens: the total variation",
    l3RangeHelp: "the distance where it flattens: beyond it, wells are unrelated",
    l3Fit: "Fit automatically",
    l3Readout: "Fit error: <b>{e}</b> (smaller is better)",
    l3h: "the distance between two wells",

    navContents: "Lessons",
    navPrev: "Previous",
    navNext: "Next",
    usesVariogram: "Uses the variogram from step 3: {model}, c₀ = {c0} m², s = {s} m², a = {a} km.",
    show: "Show",

    l4Title: "4. Kriging: drawing the whole map",
    l4Plain:
      "We only measured the water depth at the wells. <b>Kriging</b> fills in every other place with a weighted average of the wells. The variogram from step 3 decides the weights: wells that are close and well connected get more weight. Kriging also tells us how <b>uncertain</b> each estimate is.",
    l4Try:
      "Click anywhere on a map to see how the wells are weighted at that spot. Drag a well to move it, and watch the uncertainty follow it.",
    l4Kriging: "Kriging",
    l4Idw: "Inverse distance (IDW)",
    l4Truth: "True map",
    l4Unc: "Uncertainty (± m)",
    l4Low: "low",
    l4High: "high",
    l4Readout:
      "At the <b>?</b> mark: estimate <b>{est} m</b> ± <b>{sd} m</b>. The numbers on the wells are their weights. They add up to 1.",
    l4Error:
      "Average error compared with the true map: kriging <b>{k} m</b>, inverse distance <b>{i} m</b>.",
    l4TruthNote:
      "In real life we never see the true map. Here we can, because the wells are imaginary.",
    l4Notice:
      "Notice that the kriging map is smooth, while the true map is rougher. That is the next lesson.",
    l4zhat: "the estimated water depth at a new place x₀",
    l4lambda: "the weight given to well i",
    l4sum: "the weights add up to 1, so the estimate is not biased",
    l4gamma: "the variogram between two places (from step 3)",
    l4mu: "a helper number that makes the weights add up to 1 (a Lagrange multiplier)",
    l4var: "the kriging variance: how uncertain the estimate is. Its square root is the ± shown on the map",

    l5Title: "5. Simulation: many possible maps",
    l5Plain:
      "Kriging gives one best guess, but it is too smooth: the real ground is rougher. <b>Simulation</b> draws many different maps instead. Each one honours every well and is as rough as reality. Where the maps disagree with each other, we are uncertain.",
    l5Try:
      "Press “Another possible map” a few times and compare. Then make 20 more and look at their average.",
    l5Another: "Another possible map",
    l5More: "Make 20 more",
    l5Current: "Possible map no. {n}",
    l5Average: "Average of all possible maps",
    l5Readout: "Possible maps so far: <b>{n}</b>.",
    l5Working: "Drawing…",
    l5Notice:
      "Each possible map is rough, like the true map. Their average becomes smooth, just like kriging.",
    l5zl: "the value at x₀ in possible map number ℓ",
    l5zsk: "the kriging estimate at x₀, using the wells and the points already drawn",
    l5sd: "the kriging uncertainty at x₀",
    l5eps: "a random number from a bell curve (the normal distribution)",
    l5Sgs:
      "Visiting the grid points in a random order and repeating this one point at a time is called <b>Sequential Gaussian Simulation (SGS)</b>.",
    l5End:
      "You have finished all five lessons! From one simple idea, that nearby things are similar, we built complete maps and measured how uncertain they are.",

    axDist: "distance between wells, h (km)",
    axDiff: "difference in water depth, Δz (m)",
    axGamma: "semivariance, γ (m²)",
  },

  am: {
    pageTitle: "ጂኦስታቲስቲክስ በምስል",
    intro:
      "ጂኦስታቲስቲክስ (geostatistics) <b>ባልለካናቸው</b> ቦታዎች ያለውን እሴት፣ <b>በለካናቸው</b> ቦታዎች መረጃ ተጠቅሞ የመገመት ሳይንስ ነው። እዚህ የከርሰ ምድር ውሃ ምን ያህል ጥልቅ እንደሆነ የሚለኩ ምናባዊ የውሃ ጉድጓዶችን በመጠቀም ትማራላችሁ።",
    newWells: "አዲስ ጉድጓዶች",
    legendTitle: "የውሃ ጥልቀት",
    legendShallow: "ጥልቀቱ አነስተኛ",
    legendDeep: "ጥልቅ",
    mathTitle: "ሒሳቡ",
    inWords: "በቃላት",
    tryIt: "ይሞክሩ",
    km: "ኪ.ሜ",

    l1Title: "1. የተቀራረቡ ነገሮች ይመሳሰላሉ",
    l1Plain:
      "እርስ በርሳቸው የተቀራረቡ ጉድጓዶች ብዙውን ጊዜ ተመሳሳይ የውሃ ጥልቀት አላቸው። የተራራቁ ጉድጓዶች ግን በጣም ሊለያዩ ይችላሉ። ይህ ቀላል ሐሳብ የጂኦስታቲስቲክስ መሠረት ነው።",
    l1Try:
      "አንድ ጉድጓድ ይጫኑ። መስመሮቹ ከ3 በጣም ቅርብ እና ከ3 በጣም ሩቅ ጎረቤቶቹ ጋር ያገናኙታል። አዲስ ጉድጓድ ለመቆፈር ባዶ ቦታ ይጫኑ።",
    l1Plot:
      "እያንዳንዱ ነጥብ አንድ ጥንድ ነው፦ የተመረጠው ጉድጓድ እና ሌላ አንድ ጉድጓድ።",
    l1Readout:
      "3ቱ በጣም ቅርብ ጉድጓዶች በአማካይ በ<b>{near} ሜ</b> ይለያያሉ። 3ቱ በጣም ሩቅ ደግሞ በ<b>{far} ሜ</b> ይለያያሉ።",
    l1Exception:
      "ይህ ጉድጓድ ልዩ ሁኔታ ነው! «ብዙውን ጊዜ» ማለት «ሁልጊዜ» ማለት አይደለም። ሌሎች ጉድጓዶችንም ይሞክሩ።",
    l1Nearest: "3 በጣም ቅርብ",
    l1Farthest: "3 በጣም ሩቅ",
    l1h: "በሁለት ጉድጓዶች መካከል ያለው ርቀት",
    l1xy: "የጉድጓዱ በካርታው ላይ ያለው ቦታ (ምሥራቅ፣ ሰሜን)",
    l1z: "በአንድ ጉድጓድ የተለካው የውሃ ጥልቀት",
    l1dz: "ሁለቱ ጉድጓዶች ምን ያህል እንደሚለያዩ",

    l2Title: "2. ቫሪዮግራም (variogram)፦ በእያንዳንዱ ርቀት ምን ያህል ይለያያሉ?",
    l2Plain:
      "አሁን <b>ሁሉንም</b> የጉድጓድ ጥንዶች በአንድ ጊዜ እንመልከት። ጥንዶቹን በርቀታቸው በቡድን እንከፍላለን፤ ለእያንዳንዱ ቡድን ጉድጓዶቹ በአማካይ ምን ያህል እንደሚለያዩ እናሰላለን። ይህንን ከርቀት ጋር በግራፍ ስናሳይ <b>ቫሪዮግራም (variogram)</b> የሚባል ኩርባ እናገኛለን።",
    l2Try:
      "የርቀት ክልል ለመምረጥ ተንሸራታቹን ያንቀሳቅሱ። ካርታው በዚያ ክልል ውስጥ የሚገኙትን የጉድጓድ ጥንዶች ያሳያል።",
    l2Cloud: "ሁሉንም ጥንዶች አሳይ («የቫሪዮግራም ደመና»)",
    l2Band: "የርቀት ክልል",
    l2Readout:
      "<b>{n} ጥንዶች</b> ከ{a} እስከ {b} ኪ.ሜ ርቀት ላይ ናቸው። አማካይ γ <b>{g} ሜ²</b> ነው።",
    l2Notice:
      "ልብ ይበሉ፦ γ ከርቀት ጋር ያድጋል፣ ከዚያም ይረጋጋል። ከተወሰነ ርቀት በላይ ጉድጓዶቹ ስለ አንዳቸው ሌላውን ምንም አይነግሩንም።",
    l2gamma: "በርቀት h ያለው ቫሪዮግራም፦ ያን ያህል የተራራቁ ጉድጓዶች በአማካይ ምን ያህል እንደሚለያዩ",
    l2N: "በዚያ የርቀት ክልል ውስጥ ያሉ የጥንዶች ብዛት",
    l2diff: "በአንድ ጥንድ ውስጥ ባሉት ሁለት ጉድጓዶች መካከል ያለው ልዩነት፤ ትላልቅ ልዩነቶች የበለጠ እንዲቆጠሩ በካሬ ይባዛል",
    l2half: "የተለመደ ስምምነት ነው፤ ለዚህም ነው ሴሚ-ቫሪዮግራም (semi-variogram) የሚባለው",

    l3Title: "3. የቫሪዮግራም ሞዴሎች፦ ለስላሳ ኩርባ መሳል",
    l3Plain:
      "ከደረጃ 2 የተገኙት ነጥቦች ወጣ ገባ ናቸው። በኋላ ካርታ ለመሥራት እነሱን የሚከተል ለስላሳ ኩርባ ያስፈልገናል። የጂኦስታቲስቲክስ ባለሙያዎች እያንዳንዳቸው በሦስት ቁጥሮች የሚቆጣጠሩ ጥቂት መደበኛ ቅርጾችን ይጠቀማሉ።",
    l3Try:
      "ኩርባው ነጥቦቹን እስኪከተል ድረስ ተንሸራታቾቹን ያንቀሳቅሱ፣ ወይም «በራሱ አስማማ» የሚለውን ይጫኑ። ከዚያም ሌሎቹን ቅርጾች ይሞክሩ።",
    l3Model: "ቅርጽ",
    l3Spherical: "ስፌሪካል (spherical)",
    l3Exponential: "ኤክስፖኔንሻል (exponential)",
    l3Gaussian: "ጋውሲያን (Gaussian)",
    l3Nugget: "ናጌት (nugget)",
    l3Sill: "ሲል (sill)",
    l3Range: "ሬንጅ (range)",
    l3NuggetHelp: "በዜሮ ርቀት ላይ ያለው ዝላይ፦ የመለኪያ ስህተት እና በጣም አነስተኛ ርቀት ላይ ያለ ልዩነት",
    l3SillHelp: "ኩርባው የሚረጋጋበት ደረጃ፦ አጠቃላይ ልዩነቱ",
    l3RangeHelp: "ኩርባው የሚረጋጋበት ርቀት፦ ከዚያ በላይ ጉድጓዶቹ አይዛመዱም",
    l3Fit: "በራሱ አስማማ",
    l3Readout: "የአስማሚነት ስህተት፦ <b>{e}</b> (ያነሰ የተሻለ ነው)",
    l3h: "በሁለት ጉድጓዶች መካከል ያለው ርቀት",

    navContents: "ትምህርቶች",
    navPrev: "ቀዳሚ",
    navNext: "ቀጣይ",
    usesVariogram: "ከደረጃ 3 ያለውን ቫሪዮግራም ይጠቀማል፦ {model}፣ c₀ = {c0} ሜ²፣ s = {s} ሜ²፣ a = {a} ኪ.ሜ።",
    show: "አሳይ",

    l4Title: "4. ክሪጂንግ (kriging)፦ ሙሉውን ካርታ መሳል",
    l4Plain:
      "የውሃ ጥልቀትን የለካነው በጉድጓዶቹ ላይ ብቻ ነው። <b>ክሪጂንግ (kriging)</b> የጉድጓዶቹን ክብደት ያለው አማካይ (weighted average) በመውሰድ ሌሎቹን ቦታዎች ሁሉ ይሞላል። ክብደቶቹን የሚወስነው ከደረጃ 3 ያገኘነው ቫሪዮግራም ነው፤ ቅርብ እና በደንብ የተዛመዱ ጉድጓዶች የበለጠ ክብደት ያገኛሉ። ክሪጂንግ እያንዳንዱ ግምት ምን ያህል <b>እርግጠኛ እንዳልሆነም</b> ይነግረናል።",
    l4Try:
      "በዚያ ቦታ ጉድጓዶቹ እንዴት እንደሚመዘኑ ለማየት በካርታው ላይ የትኛውንም ቦታ ይጫኑ። አንድ ጉድጓድ ጎትተው ያንቀሳቅሱ፤ እርግጠኛ ያለመሆኑም እንዴት እንደሚከተለው ይመልከቱ።",
    l4Kriging: "ክሪጂንግ",
    l4Idw: "ኢንቨርስ ዲስታንስ (IDW)",
    l4Truth: "እውነተኛው ካርታ",
    l4Unc: "እርግጠኛ ያለመሆን (± ሜ)",
    l4Low: "ዝቅተኛ",
    l4High: "ከፍተኛ",
    l4Readout:
      "<b>?</b> ምልክት ባለበት ቦታ፦ ግምቱ <b>{est} ሜ</b> ± <b>{sd} ሜ</b> ነው። በጉድጓዶቹ ላይ ያሉት ቁጥሮች ክብደቶቻቸው ናቸው፤ ድምራቸው 1 ነው።",
    l4Error:
      "ከእውነተኛው ካርታ ጋር ሲነጻጸር አማካይ ስህተት፦ ክሪጂንግ <b>{k} ሜ</b>፣ ኢንቨርስ ዲስታንስ <b>{i} ሜ</b>።",
    l4TruthNote:
      "በእውነተኛው ዓለም እውነተኛውን ካርታ ፈጽሞ አናየውም። እዚህ ግን ጉድጓዶቹ ምናባዊ ስለሆኑ ማየት እንችላለን።",
    l4Notice:
      "ልብ ይበሉ፦ የክሪጂንግ ካርታ ለስላሳ ነው፤ እውነተኛው ካርታ ግን ይበልጥ ሸካራ ነው። ይህ የሚቀጥለው ትምህርት ነው።",
    l4zhat: "x₀ በሚባል አዲስ ቦታ ላይ የተገመተው የውሃ ጥልቀት",
    l4lambda: "ለጉድጓድ i የተሰጠው ክብደት",
    l4sum: "ግምቱ እንዳያዳላ የክብደቶቹ ድምር 1 ነው",
    l4gamma: "በሁለት ቦታዎች መካከል ያለው ቫሪዮግራም (ከደረጃ 3)",
    l4mu: "የክብደቶቹ ድምር 1 እንዲሆን የሚረዳ ተጨማሪ ቁጥር (Lagrange multiplier)",
    l4var: "የክሪጂንግ ቫሪያንስ (kriging variance)፦ ግምቱ ምን ያህል እርግጠኛ እንዳልሆነ። ስኩዌር ሩቱ በካርታው ላይ የሚታየው ± ነው",

    l5Title: "5. ሲሙሌሽን (simulation)፦ ብዙ ሊሆኑ የሚችሉ ካርታዎች",
    l5Plain:
      "ክሪጂንግ አንድ ምርጥ ግምት ይሰጣል፤ ነገር ግን በጣም ለስላሳ ነው፤ እውነተኛው መሬት ግን ይበልጥ ሸካራ ነው። <b>ሲሙሌሽን (simulation)</b> በምትኩ ብዙ የተለያዩ ካርታዎችን ይስላል። እያንዳንዱ ካርታ ከሁሉም ጉድጓዶች ጋር ይስማማል፤ ሸካራነቱም እንደ እውነታው ነው። ካርታዎቹ እርስ በርሳቸው በማይስማሙበት ቦታ እርግጠኛ አይደለንም።",
    l5Try:
      "«ሌላ ሊሆን የሚችል ካርታ» የሚለውን ጥቂት ጊዜ ይጫኑና ያነጻጽሩ። ከዚያም 20 ተጨማሪ ይሥሩና አማካያቸውን ይመልከቱ።",
    l5Another: "ሌላ ሊሆን የሚችል ካርታ",
    l5More: "20 ተጨማሪ ሥራ",
    l5Current: "ሊሆን የሚችል ካርታ ቁ. {n}",
    l5Average: "የሁሉም ሊሆኑ የሚችሉ ካርታዎች አማካይ",
    l5Readout: "እስካሁን <b>{n}</b> ሊሆኑ የሚችሉ ካርታዎች።",
    l5Working: "በመሳል ላይ…",
    l5Notice:
      "እያንዳንዱ ሊሆን የሚችል ካርታ እንደ እውነተኛው ካርታ ሸካራ ነው። አማካያቸው ግን ልክ እንደ ክሪጂንግ ለስላሳ ይሆናል።",
    l5zl: "ቁጥር ℓ በሆነው ሊሆን የሚችል ካርታ ውስጥ በx₀ ያለው እሴት",
    l5zsk: "በx₀ ያለው የክሪጂንግ ግምት፣ ጉድጓዶቹን እና ቀድመው የተሳሉትን ነጥቦች በመጠቀም",
    l5sd: "በx₀ ያለው የክሪጂንግ እርግጠኛ ያለመሆን",
    l5eps: "ከደወል ቅርጽ ኩርባ (normal distribution) የተወሰደ የዘፈቀደ ቁጥር",
    l5Sgs:
      "የፍርግርጉን (grid) ነጥቦች በዘፈቀደ ቅደም ተከተል እየጎበኘን ይህንን አንድ በአንድ መድገም <b>ሲኩዌንሻል ጋውሲያን ሲሙሌሽን (Sequential Gaussian Simulation፣ SGS)</b> ይባላል።",
    l5End:
      "አምስቱንም ትምህርቶች ጨርሰዋል! «የተቀራረቡ ነገሮች ይመሳሰላሉ» ከሚለው አንድ ቀላል ሐሳብ ተነስተን ሙሉ ካርታዎችን ሠራን፤ ምን ያህል እርግጠኛ እንዳልሆኑም ለካን።",

    axDist: "በጉድጓዶች መካከል ያለው ርቀት፣ h (ኪ.ሜ)",
    axDiff: "የውሃ ጥልቀት ልዩነት፣ Δz (ሜ)",
    axGamma: "ሴሚቫሪያንስ (semivariance)፣ γ (ሜ²)",
  },
} as const;

export type TextKey = keyof typeof text.en;
