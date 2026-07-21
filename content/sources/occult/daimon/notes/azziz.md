Ibn cAzziiz al-Qusantini's tables
for computing planetary aspects
Josep Casulleras
Key Words Applied mathematics. astronomical tables, medieval
astrology, astrology in the Maghrib, astrology in al-Andalus, planetary
aspects, projection of rays, hOUf lines, Ibn cAzzuz a l - Q u s a n ~ T n T , Ibn
Mucadh al-JayyanT, al-BTriinT, AbO. Macshar.
Abstract
This paper presents a chapter of the fourteenth century at-21) al-Muwajiq
by Ibn aJ-CAzzuz al-Qusanrini (d 1354) containing lhe only known example
of numerical tables designed for the computation of the astrological
aspects following the most popular method for this practice in lhe Islamic
area: that of lhe Single Hour Line. Tbn cAzzuz presents two different
procedures. The first one illustrates, according to the author. the melhod
normally used in his time, mentioned by "Ptolemy and Hermes", and
transmitted by Abu MaCshar. The second one is lhe technique that he uses
for computing his tables for the latitude of Fes. The geometrical approach
of both procedures is the same and what lbn CAzzOz offers wilh his (abies
is a computational tool that aims to improve (he system avoiding certain
errors produced by previous algorilhms. Nevertheless, Ibn cAzzuz's final
belief is that the computation for lhe aspects must be performed on lhe
ecliptic following the simple method - consisting of adding or subtracting
lhe different aspects to the ecliprical longitude of the star or planet -.
whereas lhe use of his tables is more appropriate for another astrological
practice: the rasyfr or system of progress ions.
SlIha)'17 (2007) pp. 47-114
48
1. Introduction
J. CasulleR$
The branch of astrology Ihat deals wilh nativities aims 10 decipher the
influence lhat certain elements of the celestial sphere exert on lbe life and
personality of an individual according to lheir positions at the moment of
birth. The computational component of this doctrine has three main
concerns, all of them taken from the ancient Greek astrologers, namely:
the division of houses (in Arabic taswiyat al-buyar, which deals with the
positions of these elements in relation to the local horizon), the theory of
aspects or projection of rays (in Arabic M a ! r a ~ 1 al-shlfd'dl, concerned
with the relative positions of these elements to each other) and the theory
of progressions (in Arabic tasyfr, devoted to the determination of the
moment at which a certain given position will take place between two of
these elements)l. Since the geometrical interpretation of these questions
requires mathematical definitions and calculations which are different from
those applied to aSlronomy, the medieval astronomers and mathematicians
had to provide the necessary tools for those practices, which were
perfonned by means of arithmetical or trigonometric algorithms,
numerical tables and analogical instruments. The investigation of these
solutions, undertaken by historians of science in recent years, revealed the
interest of sources with astrological contents for the history of applied
mathematics and led to a classification of methods for the three
aforementioned practices that correspond to a variety of geometrical
approaches and also produce different resuIrs1.
For Ihesc lopics in the Greek astrological lradilion, the standard reference is Boucht-
Leclerq, Astrologit, 256-286 (houses), 165-179, 247-251 (asptW), 411-422
(progressjons).
2 As a bibliographical list for the study of astrological materials, one can consider lhe
following works, in chronological order, and the references that they contain: Kennedy
& Krikorian, "Rays"; North, -Horoscopes" (containing a classification of seven methods
found in ancient and medieval sources for the division of houses); Hogendijk, "Two
Tables-; Kenoedy, -Ibn Mu"lIdh" and -Houses" (research on the evidence of the methods
for the division of houses of North's classification in Arabic and Persian sources,
enlarging the c1assificalion with IWO new methods); North, "A reply-; Calvo,
-Rtsolulion graphiqur-; Hogendijk, "Progressioos" (a complete c1assiflcalion and
analysis of the methods applied in sources from the Islamic area 10 the thttt
aforementioned asuoIogical prxtices. Though an indispensable 1001 for the study of
Ibn cAulk a I - Q u s a n ~ [ n [ ' s tables for computing planetary aspects 49
The aim of this paper is to present a passage from a western Arabic
source containing the only known preserved tables designed for the
practice of projecting the rays according to what is called the Single Hour
Line method. The text consists of a chapter of the fourteenth century al-
Zi.) al-Muwafiq by Ibn al-cAzzuz al-Qusanti'ni' (d 1354)3, a work pertaining
to an astronomical Maghribi' tradition that combines the preservation of
Andalusian materials with the result of new observations and correction
of parameters using experimental methods. The passage of interest to us
here is preserved in pages [428] - [437]4 of MS D 2461 of the
Bibliotheque Generale de Rabaf, one of the two known extant copies of
the ZIt', which contains a series of twelve tables, computed for the
latitude of Fes, with the text of a chapter on the projection of rays in the
margins of pages [428] - [435Y.
As a preliminary instrument for understanding this text and analysing
medieval astrology, this article remains unpublished. A photocopy of the typed paper was
kindly made available to me by the author); Sams6 & Berrani, "World astrology";
Casulleras, "lbn Mucadh"; Hogendijk, "Applied Mathematics"; Sams6 & Berrani, "al-
Istiji"; Casulleras, "Aspectos" (Spanish review of the list of methods for the projection
of rays established by Hogendijk, with special attention to procedures used in al-AndaIus
and sources which were not available at the time of Hogendijk's research).
On this author and his work see the studies by Sams6: "Ibn cAzziiz" (with an outline of
the Muwafiq 'hi), "Horoscopes", "Astronomical observations", 166-167, "Zacut's
Almanach", 82-83, "MaghribT Zijes", 94, all of them reprinted in Sams6, Variorum,
2007.
4 I use numbers in square brackets in order to refer to the corresponding indications of
manuscript pages in my edition and translation of the text in appendixes 1 and 2;
facsimile edition in appendix 4.
Djebbar was the first to call attention to the existence of the Muwafiq ZiJ in Djebbar,
"Quelques ~ I e m e n t s " , 67-68. Cf. Sams6, "Ibn CAzzuz", 75-76 and n.7.
6 The other copy does not contain the tables for the projection of rays and is extant in
manuscript 8772 of the J:Iasaniyya Library. See Sams6, "Ibn CAzzuz", 76 and n.11, for
details.
7 Cf. Sams6, "lbn cAzzuz", 95.
50 I. Casulleras
the accompanying tables, we need lhe definitions of some mathematical
procedures for the projection of rays, all of them taken from the
classification of methcxls established by Hogendijk in 19981, an essential
tool for understanding the mathematical implications of the astrological
practice. In his study of sources dealing wilh the computational techniques
used by astrologers, Hogendijk found up to ten different methods for
casting the rays. As a reference, in this introduction I give brief
definitions for these procedures. as well as a list of the symbols used in
the following pages, which may indicate either a value, a point of me
celestial sphere or a function if followed by variables in parentheses. In
order 10 try to pUllbn 'Azzilz's work in context, J also give the list of the
olher tables for the projection of rays known to me. It is assumed that the
reader has some knowledge of the aSlronomical coordinate systems or
access to an imroduction to spherical astronomy9.
Symbols used (in Greek alphabetical order)
ao equatorial right ascension. ao-I is me inverse function of ao.
rewming me ecliptical longiwde >.. corresponding to me
equatorial degree represemed by ao. Example: given a poim P
on Lhe ecliptic. wim right ascension A on the equator, aJ..P) =
A. and a.-'(A) = P.
a. oblique ascension. Arc of the celestial equator which rises
simullaneously wiLh a given arc of Lhe ecliptic at a place of
latiwde 4P. Similarly. a_. is for oblique descension, that is the
oblique ascension for a horizon of latiwde -<P. and a f is the
oblique ascension at a horizon of latitude ~ . a.-I and a f -I are
respectively inverse functions of a. and ai' returning the
ecliptical longitudes >.. corresponding to the equatorial degrees
represented by a. and a f •
{3 ecliptical latitude.
• Cf. Hogendijk, 'Progressions", § 4. Readers of Spanish can also see Casuller.lS,
"Aspectos" .
9 Readers of Spanish can see. for example. 0rUs. CatalJi &. NufIeZ. Asrronomia a/irica
or Manln. AsmH/oIIIJa.
Ibn rAzzuz al-Qusan![nf's tables for computing planetary aspects 51
o equatorial declination.
/j,cx ascensional difference. For an ecliptical degree A, /j,CX(A) =
CXO(A) - CX",(A) I .
€ obliquity of the ecliptic.
A ecliptical longitude: I use AI' A4 , A7 and AIO to indicate
longitudes of the cardines (Arabic watad, pi. aWUid) or
intersections of the ecliptic with the local horizon and meridian,
which are, respectively, the ascendent (first house), lower
midheaven (fourth house), descendant (seventh house), and
upper midheaven (tenth house).
~
terrestrial latitude, other than ,p, beeing ,p > ~ > 0°. Tis the
complement of,p: 90° - ~ .
,p observer's terrestrial latitude. ,p is the co-latitude, this is 90° -
,po
Methods for projecting the rays
The Greek theory of the projection of rays is sometimes defined in terms
of the astrologically significant elements emanating rays in certain
directions. If one of these rays reaches another object at a particular
meaningful angular distance, the two objects make an aspect. Depending
on the arc or angle involved, this aspect can be a sextile (60°), a quartile
(90°), a trine (120°), or an opposition (180°). Moreover, if the aspect is
found in the sense of increasing ecliptical longitudes, it is a left ray,
otherwise, it is right, with different astrological effects. Ideally, the
complete set of aspects is defined by means of a regular hexagon, a square
and an equilateral triangle, all of them inscribed in a great circle and with
a common vertex at the position of the object that casts its rays (point P
in Figure I). The simplest procedure for finding the position of these rays
or aspects consists of measuring the defining distances along the ecliptic
but, as we shall see, most methods require the determination of these
intervals along another great circle, thus demanding, first, a projection of
an ecliptic point onto this circle and, later, a projection from a point of
that cirle back to the ecliptic. Other approaches also take ecliptic latitudes
into account.
52 J. Casullcras
SimpLe Ecliptical method ignoring latitudelO
p
Figure 1
In this melhod the aspects are simply measured along the ecliptic. In
Figure I, P represents a planet casting its sextiles (5), trines (n,
quadratures (Q> and opposition (0) directly on the ecliptical circle, such
inscribing a series of regular polygons in it. If the planet has any ecliptical
latitude (13), Ihis can be ignored, and its longitude (A) is taken as the
common vertex of lhe polygons. This is the method favoured by Ibo
cAzziiz. though his tables are devised for the Single Hour Line method
(see below).
10 For details on the use of this method, see Hogendijk, "Progressions". § 4.1: Casulleras,
"Aspectos·,31-32.
Ibn rAzzaz al-Qusan!fnr's tables for computing planetary aspects 53
Ecliptical methods considering latitude'l
Figure 2
A more sophisticated theory takes as the origin for the rays the position
of the planet without ignoring its ecliptical latitude ((3). Hogendijk found
two solutions for this alternative, following previous work by Kennedy
and Krikorian12.
In the first one, the angular distances for the different aspects are taken
along arcs of the great circle connecting the object emanating rays with
the ecliptic. Figure 213 represents the left sextile of a planet at P, with
11 See Hogendijk. "Progressions", § 4.1; Casulleras, "Aspectos". 33-34.
12 cr. Kennedy & Krikorian, "Rays", 5-7.
13 For this and the following figures I use version 2.0 of the computer program ESB
(Electronic Spherical Blackboard) developed by H. Mielgo, University of Le6n.
54 J. Casul1ens
latitude (3(P): arc PS is 60° long and lhe longitude of the aspect is A =
VS.
The second procedure considers the regular polygons defining the
aspects inscribed in the great circle that passes through the position of the
planet and crosses the ecliptic at 90°, in such a way that - for any object
with latitude (3 ~ 0° - only the (WO quartiles would be on the ecliptic,
whereas the Olher aspects would have their own latitudes.
Single Position Semicircle merllodl4
p
, A.. [p)
Figure 3
A position circle is a great circle crossing the North and South points on
the local horizon, of latitude tP. and is equivalent to a horizon of a latitude
E (beeing 4> > ~ > 0°) passing through a desired point of the celestial
sphere. For this reason, some sources use the term incident horizon (al-
ufuq a l - ~ I t i d i l h ) for these circles, and are employed in various procedures
for all the aforementioned astrological practices (division of houses.
14 See Hogendijk, "Progressions", § 4.4; Casulleras. "Aspecros", 37-38.
lbn rAzztlz a l - Q u s a n ~ [ n r ' s tables for computing planetary aspects 55
projection of rays and tasyfr) 15 • The Single Position Semicircle method
defines the aspects on the ecliptic using the semicircle through the North
and South points of the local horizon and through the object that casts its
rays. Figure 3 illustrates the case for a left sextile (S) of a planet P using
this method. The procedure for determining any of the rays is as follows:
1) find the projection by means of the position circle that pass through
the ecliptical position of the object emanating rays onto the celestial
equator: point A = ( X ~ ( P ) in Figure 3.
2) from this point (A), add or subtract the equatorial arc that
corresponds to the degrees of the desired aspect, thus obtaining another
equatorial point: point B = ( X ~ ( S ) in Figure 3, with arc AB of 60°.
3) project this last point (B) back to the ecliptic using the same position
circle as before. The resulting point corresponds to the ecliptical
longitude of the desired aspect: point S = ( X ~ -I(B) in Figure 3.
Single Hour Line methodl6
This is the method for which Ibn cAzzuz computed his tables and, in
Hogendijk's opinion, it can be considered the standard method for the
projection of rays in the Islamic area, given its presence in many sources.
As an exact computation with position circles involves the use of functions
and techniques of spherical trigonometry, since ancient times the authors
developed arithmetical procedures that use seasonal hour lines as an
approximation to those circles. The seasonal hours for the period of
daylight are twelve equal divisions between sunrise and sunset; there are
also twelve equal seasonal night hours between sunset and sunrise.
Obviously, the length of these hours depends on the latitude of the place
and on the season (or, more strictly, on the day) of the year. This system
was the usual civil time-reckoning in ancient and medieval Greek, Roman,
Islamic and European civilizations. An hour line corresponding to the end
IS Cf. Hogendijk, "Two Tables", 176-178; Kennedy, "Houses", 555, 557; Dorce, Tay al-
Azyaj, 63, 67-72. An early definition of this circles is found in the treatise on the
construction of the astrolabe by al-FarghanI, probably written about 856-857, cf. Lorch,
Farghtinr, 5, 10, 60-63. I am grateful to Professor Sams6 for this information.
16 See Hogendijk, "Progressions", § 4.5; Casul1eras, "Aspectos", 38-41.
56 1. Casulleras
of one seasonal hour on the celestial sphere is a curve that links me
positions of lhe sun at that given hour through the whole year17 ,
Figure 4
The Single Hour Line method uses the hour line that passes through
the position of the object that casts the rays in the manner in which the
position semicircle was used in the preceding method. Figure 4 shows the
seasonal hour Iines11 at the eastern quadrant above the horizon for a
latitude q, = 40°. Point P is a planet on the ecliptic casting its left sextile
at S according 10 this method and the hour line through S represents the
17 Some mathematicians, at least from the end of the tenth century onwards. knew that the
result is not normally an arc of a circle but a more complex curve. Nevenheless, for
practical purposes. the hour lines on the plate of an astrolabe are obtained by dividing
into equal parts the projections of the arcs of the ~ u a t o r and t h ~ tropics of C a n c ~ r and
Capricorn between the local horizon and I h ~ meridian and joining each s e r i ~ s of three
divisions corresponding to the ordinal number of the same hour with arcs of c i r c l ~ s . See
Hogendijk, "Seasonal Hour L i n e s ~ (or details.
I1 For simplicity, I also use arcs of c i r c l ~ as approximations 10 the true hour curvcs.
Ibn CAzziiz al-Qusan!fnf'S tables for compUling planetary aspects 57
same hour line passing through P after 60 0 (arc AB on the equator) of
rotation of the celestial sphere. As regards the computational solutions, the
fundamental difference compared with the use of position circles is that
the hour lines are regularly distributed along the equator and its parallel
circles, round the axis of the earth and directly connected to the diurnal
movement of the celestial sphere, allowing for approximate arithmetical
formulae based on the application of proportions of time and simple
interpolation coefficients.
Four Position Circles methodl9
Figure 5
Unlike the Single Position Semicircle method, which uses a single
semicircle for finding the whole system of aspects, in the Four Position
19 See Hogendijk. "Progressions". § 4.6; Casulleras, "Aspectos". 41-42.
58 J. Casulleras
,
Circles method the longitude of each different aspect is found by means
of the position circle that crosses the point of the equator corresponding
to the significant angular distance. Figure 5 represents the left quanile (Q)
of a planet (P) using this method. The equatorial arc AB measures 900 •
Arc PA belongs to a great circle passing through the ecliptic position of
P and the north and south points of the local horizon, whereas arc QB
belongs to another position circle passing through B. An exact solution by
means of computation (ollowing this method requires the use of spherical
trigonometric funcrionsw.
Seven Hour Lines methotfl
/; 7
IIopK. of e- ) 10 9 • odiptk
~
J
:
Z
~
1
-
:
:
:
/
~
7
~
r
"
/
'
1
~1 I
.....
Figure 6
10 On the origin of this method and its application to the division of houses and the
projection of rays by the Andalusian mathematician loo M u ' " ~ d h al-Jayy1nr (d 1093), see
Hogendijk •• Applied Mathematics·.
21 see Hogendijk. · P r o g r e s s i o n s ~ . § 4.6; Casulleras. - Aspectos-. 43.
Ibn cAzzt1z al-Qusan!rnr's tables for computing planetary aspects 59
Following this method, the rays of a star are at the intersection points of
the ecliptic with the seasonal hour lines placed at a distance of four, six,
eight or twelve seasonal hours of the seasonal hour line crossing the
position of the star. Unlike the Single Hour Line method, this technique
needs seven different hour lines for the whole set of aspects. Figure 6
shows the seasonal hour lines in the eastern hemisphere for a latitude 4>
= 40°, and the left sextile (S), quartile (Q) and trine (1) of a planet (P)
according to this procedure. The significant angular distances are placed
on the equator: AB = 60°, AC = 90° and AD = 120°.
Other methods
For the sake of completeness, we take into account the existence in
medieval sources of other methods for projecting the rays, which will not
be referred to here in connection with tables. These methods are:
- the Right Ascension method22 , which can be defmed in the same terms
as the Single Position Semicircle method, using a celestial meridian
instead of a position semicircle.
- the Oblique Ascension method23 , in which the local horizon plays the
role of the meridian in the Right Ascension method.
- the Standard Houses method24 , in which the different aspects of a
planet are the longitudes of the third, fourth, fifth, seventh, ninth, tenth
and eleventh astrological houses computed for the -latitude corresponding
to the position circle (or incident horizon) that passes through the planet
and following what is known as the Standard method in North's
classification of methods for the division of houses. In this method for the
houses, given the right ascensions of the four cardines - aoO,,), aoC>"4),
aoe>..?) and aoO,IO) -, one must trisect each of the resulting equatorial
quadrants. The meridians that pass through these divisions determine the
22 See Hogendijk, "Progression". § 4.2; Casulleras, "AspeclOs", 34-36.
23 See Hogendijk, "Progressions", § 4.3; Casulleras, "Aspectos", 36-37.
24 See Hogendijk, "Progressions", § 3.7; Casulleras, "Aspectos", 42-43.
60 J. Cuulleras
rest of the houses on the ecliPliclS .
• there is also evidence of astrolabes devised for lhe projection of rays
using the prime vertical circle26 for measuring lhe significant angular
distances, although the textual description of this kind of procedure has
not been found in the known sourcesv .
• finally, there is a procedure for lhe stars with ecliptical latitude (fJ)
described by cAli b. AbT-I-Rijal (d ca 1048) which consists of projecting
the star omo the ecliptic using the parallel of the equator mat passes
through the position of the star. The whole melhod for finding the aspects
is nOI described in the text but there are indications in the same chapter
that the Single Hour Line method could be used once the projection of the
star onto the ecliptic is found2l •
Tables for projecting the rays
In addition to Ibn cAzzGz's tables for the projection of rays, researchers
have found some other sources containing tables for the same purpose.
Hogendijk considers the tables contained in the revision of the 211 of al-
Khwarizmi (ca 830) by Maslama al-Majri!i (d 1(07) adequate for an
approximate computation of the Four Position Circles method, whereas,
for those of al·Khwarizmi, based on lhe approximation to position circles
2S Cr. North. Horoscopes, 6, 46-47, n: see also Kennedy, "Houses", 538-540.
26 This is the great circle that crosses the zenith and the east and west points of the local
horizon.
21 See Hogendijk, "Applied Mathematics", 99 and n.3: Casulleras, "Aspectos", 43-44.
28 Cf. Casulleras, "Aspectos", 4446: Ibn A b f - I - R i j ~ l , Ubro Conplido, 173-178. In an
unpublished work lhal she kindly allowed me to consult, Ofaz-Fajardo identified a
passage of Ibn Abf-l-Rijlil's chapter on the tasy(r and the projection of rays in the al-
Mughnf If a1}k4m al·nujiJm by Ibn Hibinti (Baghdad, ninth cenrury); cf. Ibn Hibintli.
Mughnf, I: 131-134. Hogendijk relateS the Ibn Hibintli's description to the Hour Line
method for the tasyfr; cf. Hogendijk, "Progressions", § 3.1.4 and Ibn Hibintli., Mughnf,
I: 134-143.
lbn rAzzuz al-Qusan![nr's tables for computing planetary aspects 61
using hour lines, he also suggests the Seven Hour Lines method29 . Sams6
reports a reference by al-Hashimf (ca 890) on tables for projecting the
rays that Hogendijk proposes to relate with those of al-Khwarizmf30 .
Finally, concerning the two ecliptical methods considering latitude,
Kennedy and Krikorian observed that al-BIriinT gives, for both procedures,
a description with a table in his Qanun (Ghazna, Afganistan, ca 1030)31.
The preceding list is rather short and it appears to be obviuosly
incomplete if we consider that the same passage of al-BIrunJ's Qanun
alludes to the existence of tables for the Single Hour Line method for the
rays when dealing with its three possible means of resolution: "different
people followed this method for casting the rays, using the computation,
the tables or the instruments "32. Today, these tables are unknown but this
poses the question of the originality and possible sources for rbn cAzzilz's
tables. Our author only states that he "made tables for the projection of
rays for the latitude of Fes" (page [431]), and explains the details of his
computation, but he does not refer to the existence of previous sources
containing similar tables. If we consider that the works by al-BTriinT and
al-Hashimf do not seem to have been known in the western Islamic area
and that the tables of al-Khwarizmf's ZL) were unlikely to have been
available after their replacement in the revision by al-MajrTp-, we may
suppose that Ibn cAzzilz could have known the tables of al-MajrW -
which were computed for a different method - but also any other tables
for the Single Hour Line method like those mentioned by al-BIrilnI. It is
important to remember that, in an arcane discipline like astrology, both
suggesting and dismissing a possible chain of transmission are equally
risky, lacking a direct quotation in a preserved source.
29 Cf. Hogendijk, "Progressions", § 4.6 and "Two Tables".
30 Cf. Sams6, "al-BTriinT", 600: n.47; Hogendijk, "Progressions", § 4.7: n.48; al-HashimT,
ReasollS, 186, 323-324.
31 al-BTriinT, Qiinull, 1385-1392. Cf. Kennedy & Krikorian, "Rays", 5-7 and Hogendijk,
"Progressions", § 4. I.
32 Cf. al-BTriinT, Qii/lu/l, 1385:
..,..L....-J4 »i L. ...:J,.:o.- u-e rl,li tL..a...:J1 ~ . ; J - u-e ~ ~ I I ~ ~ ~ J
... - = . . ' J ' h ~ J J J I . ~ 4 J
62
2. Tide and colophon
J. Casullens
Before going imo detail, it is worth mentioning what seems to be a
disagreement between the title of Ibo cAzziiz's text and its contents. As
stated above, the manuscript contains tables for lhe projection of rays at
the latirude of Fes and a chapter on this same practice written in the
margins. Nevertheless, the liLle reads "on knowing the projection of rays,
the tasyrr of the stars and the division of houses". thus indicating that the
three astrological practices are to be dealt wilh. Besides the obvious
interpretation that the text may be truncated and the passages for the casyfr
and the houses have been lost, another explanation is also possible if we
turn to the end of the text. As a colophon, in the last paragraph Ibn
cAzzuz says more or less that the aspects must be measured along the
ecliptic following the simple method, and goes on 10 assert that "the fruit
of these tables is in the tasyfr of the slars among themselves and in
[determining) the value of the [arc of] tasyfr of one specific degree
towards another degree which is known by the tasyfr ... " , giving a clear
sense to the reference to the tasyfr in the title, and connecting with a large
tradition, attested at least from the time of Ptolemy (ca 150) and followed
by most Islamic astronomers, which uses what Hogendijk calls the Hour
Line method for the lasyfr, a procedure anologous to the Single Hour Line
method for the rays described abovell . It is more difficult to find a
relationship between the tables and the division of houses: the text does
not contain a single reference to this doctrine. I can only conjecture that
Ibn 'AzzUz had in mind the possibility of using the tables for the division
of houses following the Hour Lines methcx134 , an application that can be
performed operating with their values in a suitable m a n n e ~ .
3] Cf. Hogendijk. "Progressions-. § 3.1.4.
34 In this method. the houses are determined by the intersections of the ecliptic with the
even seasonal hour lines. Cf. North. Horoscopes. 20-27; Hogendijk, -Progressions-.
5.3.
15 This poiru merits further investigation. Sams6 observed th.at a .set of tables for the
division of houses is preserved in a previous pan (pages [366] -1377» of the same work.
cr. Sams6. "loo <AzzUz-. 9S.
Ibn cAz,ztlz a l - Q u s a n ~ [ n r ' s tables/or compUling planetary aspects 63
3. The method of "Ptolemy and Bermes"
The chapter on the projection of rays attached to the tables begins (page
[428]) with the exposition of a procedure presented as "what was
mentioned by Ptolemy and Hermes" and transmitted by Abii Macshar Cd
886) from Ptolemy. As Hogendijk remarks36 , the attribution of methods
to Ptolemy and Hermes is usual in medieval times but little evidence is
actually found in the works of the Ptolemaic and Hermetic traditions.
Indeed, only the Hour Line method for the tasyfr seems correctly
attributed to Ptolemy, because it is presented in the Tetrabiblos as an
approximation to the Position Semicircle method31 , but no single
procedure for the projection of rays or the division of houses is included
in this book. In the eleventh century, when explaining a computation for
the Single Hour Line Method for projecting the rays, al-Biriini observed
in his Qiinun that the method is incorrectly attributed to Ptolemy but
derived from his method of tasyfr8 , and the Alphonsine thirteenth
century Libro Segundo de las Armellas expresses similar doubts on the
authorship of the methods attributed to Ptolemy39. The case of Hermes
is even more flagrant because the preserved astrological works related to
him40 do not justify any of the attributions of methods to this mythical
author. Hogendijk's conclusion, based on the exploration of many texts,
is that the attribution of a method to Ptolemy normally means that this
method uses hour lines, whereas the attribution to Hermes implies the use
of position circles or semicircles. The reference to a method of "Ptolemy
and Hermes", repeated by Ibn cAzzuz when dealing with the inaccuracies
36 Cf. Hogendijk. "Progressions", § 6.1.
37 This is an anologous procedure to the Single Position Semicircle method for the rays
described above. Cf. Ptolemy, Telrabiblas. 291; Hogendijk, "Progressions", §§ 3.1.3,
3.1.4, 6.1.
38 Cf. Hogendijk. "Progressions", § 4.5. Hogendijk gives the references to al-BTranT,
Qtinun, 2: 1377 (line 14), 1378 (line 4) and 1394.
39 Cf. Rico Libras, 2: 68; 1. Casulleras, "Aspectos", 39-40.
40 Cf. Sezgin, GAS, 7: 50-58.
64 1. Casul1eras
of lhe procedure in the following pages ([430] - [431]), is certainly
peculiar and raises the question of a possible late identification of the
procedures attributed 10 both authors or, at least, gives evidence that the
attributions of methods to authors were nOl always consistent. AnOlher
related observation is found in the same work by al-Biriini mentioned
above: soon after stating mat the Single Hour Line Method for the rays
is erroneously attributed to Ptolemy, al-Biriini goes further and declares
that the method of Ptolemy for the rays needs position circles instead of
hour lines·l ,
The description of the method is presented by Ibn cAzzuz as a
quotation from AbO Ma"shar but its development is excessively brief and
confusing. Besides the use of a certain terminology, which is common to
the descriptions of this kind of procedures, we cannot establish any textual
relationship between Ibn cAzzuz's report and the corresponding passage
of the al-Mudkhal al-Kabrr ilo eilm al].kdm al-llujli.m as it is preserved42 .
Moreover, the procedure described by Tbn cAzziiz agrees only partially
with his purported source and, with some modifications which are needed
in order to make the text a cohesive whole, it would match very well the
computational procedure explained by al-BTn1ni in his Qa/lli.1I43 . The
procedure presented by Ibn cAzzuz (in [428] - [430]) under the name of
Abii Macshar is as follows:
First, we need to find "the ascendent and the tenth [house]". Then, for a
41 The relevant passage is in al-BTnJni, Q&Ul11, at the beginning of page 1379, dealing with
the case of the projeclion of the rays of a star that is found in an intermediate position,
between the local meridian and the horizon: "... the best circles (... ) are those that pass
through the two intersections of the meridian with the horizon. These and their opposite
li.e. semicircles and their complements) are the circles to be used in Ptolemy's m e t h o d ~ .
..,iJ ~ i l , ,J1.+lJ1 ........... ..!llJ ~ U ; ; ~ j ~ ..,:.n ' [ ] ! , . ~ 1 I - . ; . . 1 , .
. , " " , ~ ~ , J o I e . " ' : ' J.o..a..I,I i"',_ J1 'J...JI ~ .... L.lit.:.,
42 Lemay. AbO MaIha" 3: 549-550 (cd. Sezgin. 7; 408-410).
43 Cf. al-BTrOni. QdnUn. 1377-1385.
lbn r,4zzuz a l - Q u s a n ~ [ n r ' s tables fOT computing planetary aspects 65
1) 'I(S) = Clo-1(Clo(S) + aspect) , and
2) '2(S) = C l ~ - l ( C l ~ ( S ) + aspect) .
In the second case, the text is extremely concise: "do the same [as before]
using oblique ascensions" names in the descriptions of Abii Macsbar and
al-BIriinT. This last author takes into account the possibility of using
oblique descensions - C l _ ~ ( S ) instead of C l ~ ( S ) - when the star is in the
western celestial hemisphere but his definition of C l _ ~ as it is preserved is
erroneous45 . rbn CAzziiz continues with the observation that if the two
44 Note that the manuscript text does not mention the subtraction of aspects. I have added
this to the translation in order to have indications for the left and right aspects.
45 In Qiilllln. 1379. al-Hi"runT states that:
"... it is known that right ascensions indicate the presence of the star on the diurnal or
nocturnal meridian, that oblique ascensions indicate its presence on the eastern horizon, and
that oblique descensions, which equal the [oblique) ascensions of the nadir, you indicate with
them its pre ence in the western horizon."
,1 JL,:JI ............. l!1.ti ~ ..,..s,sJ1 u,s ~ ~ •J~ , 1,...."1 I •~ ~ u . . . . . •ul r ~
~
,
t
-
.
.
a
J
1
~
1
"
"
'
J
l
.
i
.
.
·ul, ~ ~ I ~ I ~ 4:0,5 ~ ~ . J ~ ~ I ~ u . . . . . ·ul, J...UI
...... j&.eJ1 ~ I ~ 4:0,5 ~ ~ . J ~ ~ I ~ u - . J
The last case refers to the fact that for an ecliptical degree S: a _ ~ ( S ) = a ~ ( S - 180°) - 180°
(modulo 360°). Cf. Hogendijk, "Two Tables", 178.
On page 1380, we find that:
"... if the star is on the degree of the descendent, we perform with the degree of the
ascendent, with oblique ascensions, the preceding [operations). Then, we add to each of the
results of the tran formation [of coordinates) 180 degrees, and results in the projections of
these rays."
l;,,)j . ~ r : ~ L. ~ I ~ u . . . . . ~ ~ u . . J 1 ~ J ~ w... ..... JLiJI ~ J , ) ~ ..,..s,sJI.uLS u l,
l!ll:i CJu..... ""I ~ ~ J , ) ~ W , ~ L . ~ 1 J " o : ! ~ 1 ~ ~ L- ~ I , JS ~
. .::.. L.. L.a..:.JI
The "preceding [operations)" are the same as in the procedure described by Ibn CAzzUz for
finding T1 and rz, and al-BTrunI's text proposes, for a star of longitud S, to find the longitude
of the desired aspeCl (±600
, ±90°, ± 120°) with Tz(S) = a ~ -I [a,M ± 180°) + aspect) ±
180°, which is erroneous. The correct computation, equivalent to the use of oblique
descensions: Tz(S) = a ~ -I [a_,,(S) + aspeCl) , is rz(S) = a ~ - 1 [ a ~ ( S ± 180°) + aspeCl ±
180°], that is, the transformation of coordinates must be done at the end of the operation:
Finally, on page 1383, we find that:
"... if [the star) is in the descendent hemisphere, which contains from the fourth [house), to
66 J. Casulleras
variables coincide in "a single minute", this will be the equalized ray of
the Slar, that is the position of the aspect we were looking for. The same
observation, but expressed diffrently, appears in Abu M a ~ s h a r ' s t e x t ~ .
The question is obvious: the two variables can only coincide if the Slar has
no declination, O(S) = 0°. or the place has no latitude, <p = 0°. If the
variables diverge, one must obtain the difference (iklICiltlj) between the
two rays by subtracting the closer one from the further one, counting on
the ecliptic from the position of the star:
ikhti/t1j = 1'\(S) - '2(5) I , with suitable variations of this equation for
the case thal the origin of longitudes (Aries 0°) is between '1(S) and
r,(S).
Next, the text instructs us how to find the distance (bl/cl) in seasonal
hours from the star to the local meridian using right ascensions. The term
blfd has different meanings depending on the authors. In this case, the
concept is the same used by al-BTrfint7 - expressed in degrees instead
of seasonal hours - bUI it is different from that used by AM Ma<shar,
the descendent. to the tenth (house). we lake the oblique ascensions of the nadir of the
degree and do with them the same as we did with its ascensions (i.e. the oblique ascensions
of the degree itself1. we add 180 degrees to the results of the transfonnations and this gives
the second ray .•
~
~
t
.
:
.
~
1
~
W
I
""I ..... JWI u-Ill!::'I .••.1I v-o 1j.lJ! J ~ .......--.rI ~ .:..:.LS ul
4
:
.
1
.
.
~
t
.
:
.
~
.
)
~
~
,
.
.
:
:
J
1
V
-
O
t
.
~
W ~ u.w 1.. ~ w..:., ~ I ~ ~ J ~
. Ij't:..II tLa..:J1 "'" ~ ~ J ~ Ue=oWJ
As stated above. the correct operation consists of taking the oblique ascensions of the nadir
of the degree. adding 180° to the result plus the value of the desired aspect. and performing
the transfonnation to eclipticallongitudes using oblique ascensions at the end of the whole
p=.
46 Cf. Lemay. Aba MaIha,. 3: 550 .
• ... if both the right ascensions and the ascensions of the city [i.e. oblique ascensions] take
place on one same degree and minute, the ray of the star is in this degree and minute.·
.
i
~
l
J
;
;
_
;
~
J
~
l
J
'
~
J
~
~
4
.
:
.
.
:
!
~
l
~
J
~
I
~
I
~
~
J
U
~
. ~ . ~ J 1 , ~ J ~ ~ ~ ...,.s,s:Jl t ~
47 AI-BirOni also devoted a chapter to the explanation of the different meanings of this
word. Cf. al-Biriini. Qdllall. 1375-1377.
Ibn rAzzuz al-Qusan![nf's tables for computing planetary aspects 67
who finds the distance (bucd) to the first cardine48 towards which the star
is travelling following the diurnal movement. Thus, according to Ibn
CAzziiz, one has to find first the distance in degrees, using
buCd = IClo(S) - Clo(AIO) I ' if the star is above the horizon, and
bucd = IClo(S) - Cl o(A4) I ,if the star is below the horizon,
and transform the resulting degrees into seasonal hours. At this point, the
text is confusing and probably incomplete. The passage proposes two
possible cases: the first one, having the star "in the southeastern quadrant
[of the sphere] or in its nadir, which is the northwestern quadrant", and
the second one, with the star "in the southwestern quadrant or in its nadir,
which is the northeastern quadrant". Following the literal instructions of
the text, in the first case, one has to divide the distance (bucd) by the
length of a seasonal diurnal hour of the degree of the star, whereas in the
second case, one must divide it by the length of a seasonal nocturnal hour.
In their normal sense, the words "western" and "eastern" refer to the
position of a star with respect to the local meridian, whereas the
distinction between "northern" and "southern" is frequently used to
indicate the sign of the equatorial declination (0) of the star. Nevertheless,
both elements seem to be extraneous to the problem of converting the
distance found in degrees into seasonal hours. One may conjecture that the
text is corrupt and that the words "eastern" and "\;Vestern" are traces of a
lost complementary instruction on how to find the distance taking into
account on which side of the local meridian the star is. As for the terms
"northern" and "southern", they may have belonged to another lost
description on how to find the length of a seasonal hour, a computation
which certainly involves the sign of the equatorial declination.
Bearing in mind the expressed idea of finding the hours of distance
from the star to the local meridian and the fact that we also find
references to the hours of distance to the cardine ([429] - [430]), we may
assume that, if the text were complete, it would prescribe transformation
into seasonal hours of the smallest distance in degrees, measured on the
equator, between the star and the local meridian. This operation is simply
48 For this term, see in the introduction above the paragraph dealing with the Standard
Houses method for the projection of rays.
68 J. ClI$ulleras
performed by dividing the distance in degrees by the length of a diurnal
or nocturnal seasonal hour, depending on whether the star is above or
below the horizon.
Next, we find what the text calls equation (ufdt1):
rcfdl1 = blld (in seasonal hours) x ildltilllj I 6 .
This definition is equivalent (0 that of the ufdl1 used by al-Biriint9, the
only changes being the use of the bifd in degrees and the use, as a
divider. of the semidiurnal or seminocturnal arc of the star, depending on
whether it is above or below the horizon, thus obtaining the same result.
The lasl step is to apply the ufdfllQ '1> in a suitable way depending on
whether '1 or '2 is greater, in order to obtain what the text calls an
equalized ray (r.). Thus
'.(S) = 'I(S) + tifdn • if'l < '2 , and
,.(S) = '1(S) - rcfdl1 , if't > '2 .
The application of the /ddil to obtain the final result also coincides with
what al-BImni prescribes so . Consequently, according to my interpretation
of Ibn cAzzuz's text, the two procedures are equivalent with the exception
that, as I said, al-Bimni considers the use of oblique descensions for
finding '2 when the star is in the western half of the celestial sphere,
whereas this possibility is not considered in the description reported by
lbn cAzzuz, or in the preserved version of Abu Macshar's Mudkllal.
Moreover, this last text also uses a different concept of bu'd, as we have
seen, and a different final application of the tddn, for it regards the
double possibility of having a right aspect, in which case the application
is equal to that reported by Ibn cAzzuz, or a left aspect, in which case one
must invert the sign of the equation.
Finally. Ibn cAzzuz declares (page [430]) that this "is the method of the
49 cr. al-Biriini, Qil1IQll. 1384. Ibn Mtflldh al-Jayyani uses the same expression but for a
different system of computation for the rays. which corresponds to the Seven Hour Lines
method: cf. Casulleras. "Ibn M u < i l d h ~ . 400-402.
so Cf. al-Biriini. Ql2!l1111. 1384.
Ibn cAzzt1z al-Qusan!rnr's tables for computing planerary aspects 69
wise people in our days". Nevertheless, the procedure has "some
approximation if the star is in the two eastern quadrants, and a great flaw
if the star is in the two western quadrants ... ". It is the lack of a correct
use of oblique descensions in the calculations that generates these errors
and the Ibn cAzzUz's criticism.
4. The method of Ibn <Azziiz's tables
The second part of Ibn cAzzUz's text ([431] - [435]) is devoted to the
structure of his tables "for the projection [...] of the rays for the latitude
of Fes" and the way they should be used. Both the computation of the
tables and the instructions for their use perfectly agree with the idea of
using hour lines for defining the aspects of a star or planet. The tables are
intended to contain the degrees corresponding to the points of the equator
resulting from projecting onto this circle the ecliptical degrees using hour
lines. The different columns give:
column 1: arguments, ecliptical degrees, each table for a sign and its
nadir.
column 2: right ascensions of the arguments, ao(column 1), for an
obliquity of the ecliptic of € = 23 ;33 0, not stated in the text but used
by Ibn CAzzuz in other tables of the same 2fj51;
columns 3 to 7 (headers alif ... ha' = 1 ... 5): equatorial degrees of
the projections of the arguments using the hour line corresponding to
the header of the column;
column 8 (header waw = 6): oblique ascensions of the argument,
a<l>(column 1), for 4J = 33;40, not stated but used by Ibn cAzzUz for
the latitude of Fes elsewhere52 ;
column 9: length of a seasonal hour (azmiin al-sactit) for the degree of
the argument.
The text ([432] - [434]) also explains how Ibn cAzzuz computed the
51 Cf. J. Sams6, "rbn cAzziiz", 93.
52 Sams6 found this table and the one in column 9 in a previous part of the manuscript,
where the value for the latitude is given. Cf. Sams6, "Ibn cAzziiz", 95.
70 I. Casulleras
tables. Take 1/6 of the ascensional difference of each degree of the
argument: " , , ( ~ ) / 6 , for ~ ~ {l0 ... 3600j, found by 1/6 X (column 2 -
column 8)SJ. The colulTUls for hours 1 to 5 are found by subtracting,
respectively, 1/6,2/6 .. 5/6 of the ascensional difference from the value
for hour O. Since Ibn CAzzuz realized that there exists a symmetry
between the ascensions of a sign using a given hour line and the
descensions of the nadir of lhis sign using the hour line at the same
distance with respect to the horizon in the western quadrant, he explains
that he only wrote the values corresponding (0 the projections in the
eastern (upper) quadrant of the celestial sphere. Though nOl explicitly
expressed in the text, it is assumed that there also exists a symmetry
between the ascensions of a sign using the hour lines at the same distance
(measured on the celestial equator) above and below the horizon. The
titles of the sub-tables "ascensions of the sign (Aries, etc.) and
descensions of (the corresponding nadirs, this is Libra, etc.) in hours of
dislance with respect to the western h o r i z o n ~ are rather confusing. The
text, however, is more explicit and one must understand that the digit
(alif, bd', etc.) on the header of each COIUrIUl indicates the distance from
the meridian to the eastern or western horizon depending on whether we
are using the sign or its nadir. Thus, colurIUl 2 (hour 0) corresponds to
aJcolunm I), degree at midheaven or at lower midheaven, whereas
COIUrIUl 8 (hour 6) corresponds to ao(column 1), degree on the eastern
horizon or cc.(COIUrIUl I), nadir of the degree on the western horizon.
The values in COIUrIUl 9 allow for transformation into seasonal hours of the
dislance in degrees from the argument to the upper meridian, in order to
enter the colunms with the adequate parameters.
The instructions on the use of the tables, on pages [434] • [435], are
as follows:
I) Given an ediptical degree, A, that corresponds to the star that
projects its rays, find its distance to the horizon, measured on the
5J In a context of absence of negative numbers. the text requires Icolumn 2 (hour O. ao>
- column 8 (hour 6, aJ I but the absolute operator can be obviated if we consider that,
when using the absolute difference, Ibn <AzzUz gives instructions on adding or
subtracting it depending on the sign of the declination of the ecliptical degree involved:
0(».
Ibn cAau, a l - Q u s a n ~ [ n r ' s rabies for computing planetary aspects 71
celestial equator, using IaoO'I) - aoC')+.) I or IaoCA7) ao('A) I
depending on whether the star is, respectively, on the eastern or
western celestial hemisphere. Divide this distance by the value of a
diurnal or nocturnal seasonal hour for that degree, depending on
whether it is above or below the horizon, thus obtaining the distance
in hours.
2) If the star is in the eastern hemisphere, use the sub-table entitled
"ascensions of ... " the sign of the star; otherwise, use the sub-table for
the descensions of this sign. Enter the row corresponding to the given
degree and the column corresponding to the distance in seasonal hours,
now measured from the meridian (the text says from the horizon). The
table gives the projection (ascensions or descensions) of the ecliptical
degree onto the equator using the hour line for that hour.
3) To this number add or subtract the value for the desired aspect.
Using the table in reverse mode, search the resulting quantity
(corresponding to the projection of the ecliptical degree of the ray)
among the tabular values in the column for the same hour through the
following or preceding pages. The argument of this row is the
longitude of the ray. If we also have fractions of hour, the text
describes a linear interpolation method.
The above is a report of the manuscript's literal instructions.
Nevertheless, the text omits two details that the user can easily deduce.
On the one hand, when dealing with stars in the western hemisphere,
using the table for the descensions of the degree of the star we need to use
the nadir of the star because we are indeed operating with the degree of
the opposition. The synunetries considered in the tables are based on the
fact that the ascensions of a sign equal the descensions of its nadir in
terms of the arc of the celestial equator involved (this can be simply
verified by rotating the rete of a standard astrolabe), but this observation
does not consider the origin of coordinates, which will cause a difference
of 1800 between the descensions of a degree and the descensions of its
nadir. Consequently, on the other hand, when applying the corresponding
amounts of the different aspects {-60°, -900 , -120 0 , ± 1800 , + 1200 ,
+90 0 , +600 } to the number of descensions found in the table, we obtain
the equatorial points for the aspects of the opposition and we have to
consider the points diametrically opposed to them (cf. Figure 1), thus
changing the above sequence by {+ 1200 , +90 0 , +600 , ± 1800 , -60 0 , -
72 J. Casulleras
90°, _120 0 }_
After mese specifications, in order to illustrate the use of the tables
(edited and recomputed54 in appendix 3), I give numerical examples of
it, considering possible positions of a star in the fOUT quadrants of the
celestial sphere determined by the local horizon and meridian planes. To
allow comparison with the use of the algorithm for the Single Hour Line
method as described in section 3, I include the corresponding results
obtained following lbn cAzzuz's report but laking into account the use of
oblique descensions prescribed by al-Biriini. Since the use of hour lines,
as stated in the imroduclion, is sometimes intended 10 be an approximation
to the use of position circles, I also give the results that produce the
Single Position Semicircle method at the same situations ss . Finally, 1
give the results obtained with the Simple Ecliptical method, remembering
that this is Ibn cAzziiz's favourite method. In all cases, I use the values E
= 23;33°, <p = 33;40°, and a longitude of the ascendent At = 270° (AIO
~
198-19° >. ~ 90- 0° >. ~ 18-19°), '7 ,'4 , .
54 For the recomputation I follow the p ~ u r e described in the manuscript itself.
Hogendijk noted that there is another relationship between the columns two through eight
and column nine, namely: (column nine) - IS° = (1/6) x the ascensional differenece
= (minus) the constant difference between column (n+ I) and column n, for n = 2, 3,
4,5,6,7. This makes it easy to check columns two to eight approximately.
15 For the computations according to this method one can use the following p ~ u r e , for
a star of 10ngilUde). and an aspect = {60°, 90°,120°, 1&1°}: (I) the first pan of an
algorithm developed by Ibn Mlfadh al-Jayyani for the Four Position Circles method
gives the projection ontO the equator of the star casting its rays using the !X)sition circle
passing through the longitude). of the star, corresponding to a horizon of latitude ~ : this
is a l ().) (cf. !X)int A in Figure 3); modem fonnulae for Ibn Mlfadh's computations are
found in Hogendijk, •Applied Mathematics·, 96-97: his section corresponding to the
computation of point K gives the solution to our problem in this step: (2) to this a l {).)
we apply the value of the aspect in order to find allQ\her equatorial point, corres!X)nding
to the projection OntO the equator of the !X)sition of the desired ray using the same
position circle thus obtaining a,' .. al().) ± aspect (cf. !X)int B in Figure 3): (3) we can
obtain the underlying value for the latitude of ~ using tan Ha" ).) • sin[ a, - ~ ( ) . ) 1
/ tan O().): the values for o:o().) and O{).) can be obtained, respectively, with sin O().) ..
sin). . sin £ and tan aJ:A) .. cos E . tan).; (4) finally, the longitude R of the desired
ray is found with the expression sin R(a,', n = sin a,' . cos ~ / sin( cos-l ( oos E .
sin ~ + sin E . cos ~ . cos ai' ) 1 (cf. point S in Figure 3).
lbn r,4zzuz a l - Q u s a n ~ [ n r ' s tables for computing planetary aspects 73
Example for the upper-eastern quadrant
" = 219; 0°, aoO,,) = 270; 0°, ao(") = 216;35°, diurnal hour length =
13;20°, distance in seasonal hours = 1270; 0° - 216;35° 1 / 13;20° =
4; 0 hours. We use the column for hour 2, the distance from the
meridian. Tabular value for" and hour 2 = 219;55°.
aspect ascensions nearest tabular Single Single Simple
in hour 2 tabular }. Hour Position Eel iptic
value Line Semicirele method
method method
-60· 159;55· 159;47· 160· 158; 9· 161; 6· 159; o·
-90· 129;55· 129;25· 131· 129; O· 132;48· 129; O·
-120· 99;55· 99;47· 104· 101;39· 105;38· 99; O·
180· 39;55· 39;41· 46° 45; 0° 47;49· 39; 0°
120· 339;55· 339;54° 336° 335;55° 336;18° 339; 0°
90° 309;55° 309;53° 303· 303;14· 302;47· 309; 0°
60° 279;55° 279;58° 274· 274;29° 273;34· 279; 0°
Example for the upper-western quadrant
" = 153' 0° a (,,) = 90' 0° a (,,) = 154'58° diurnal hour length =) '0 7 ,) 0 "
16;11°, distance in seasonal hours = 190; 0° - 154;58°1 /16;11° =
4; 1 hours. We the use column for hour 2 and the nadir of" = 153° +
1800
= 333°. Tabular value for 333° and hour 2 = 337;18°. We also
consider the correspondences on the celestial equator between the aspects
of the degree and those of its opposition.
aspect ascensions nearest tabular Single Single Simple
in hour 2 tabular }. Hour Position Eel iptic
value Line Semici rele method
method method
(-60·) 120° 277;18° 277;49° 272° 270;41· 269; 8· 273; O·
(-90·) 90· 247;18· 246;57° 244° 243;53° 242;30° 243; 0°
(-120°) 60° 217;18· 217;48· 217· 216;26° 215;58° 213; O·
(180°) 0° 157; 18· 157;45· 158· 153; 0° 153; 0° 153; O·
(120·) -60· 97;18· 97;35· 102· 103;24· 107;26· 93; 0°
(90·) -90· 67;18· 67;16° 74· 76;24· 80;10· 63; 0°
(60·) -120· 37;18° 36;54° 43° 46;21° 49; 9· 33; 0°
Example for the lower-western quadrant
" = 67' 0° a (,,) = 90' 0 0
a (,,) = 65' 9° nocturnal hour length =, , 0 7 ,,0 "
12'27° distance in seasonal hours = 190' 0° - 65' 9° 1 / 12'2r = 2' 0, , . ""
hours. We use the column for hour 4 and the nadir of" = 67° + 180°
74 J. Casulleras
= 247 0 tabular value for 247 0 and hour 4 = 255;21 0 • We also consider
the correspondences between the aspects.
aspect ascensions nearest tabular Single Single Sirrple
in hour 4 tabular l "w PositiOfl Eel iptic
value Line Semicircle method
method method
(-60·) 120· 195;21· 195;20· 194· 193; 7" 196; 6" 187; O'
(-90°) 90' 165;2'" 165;47" 167" 165;17" 170; 4" 157; O'
(,120·) 60' 135;21" 135;38" 140· 136;lS" 144; 19" 127; O'
(llW· ) O' 75;21· 75;26" 8'" 67; O· 67; O· 67; O'
(120·) -60' 15;21· 15;43" 21' 21;41" 26;38" ,- O'•(90") ·90· 345;21· 345;05" 340· 341; 4" 343;23" 337; O'
(60°) ., 20· 315;21· 315;21" 304" 304; 1· 304;23" 307; O'
Example for the lower-eastem quadrant
A = 302; 0°,00(>'1) = 270; 0°, aJX} = 304;17°. nocturnal hour length
= 17;19°, distance in seasonal hOUfS = 1270; 0° - 304;17°1/17;19°
= 1;59 hours. We use the column for hour 4, the distance from the
meridian. Tabular value for A and hour 4 = 313;33°,
aspect ascensions nearest tabular Single Single Sillple
in hour 4 tabular l , ~ , Position Ecl iptic
value Line Semicircle method
method method
-60- 253;33- 253:
" 245- 245:26- 245;14- 242; O·
-90- 223;33- 223:15" 219" 219; B- 219;55" 212; O·
-120" 193;33- 193:10" 192" 192; ,. 194;12" 162; O·
'80' B3;33" B3:24" B6" BS; O· 142;21- 122; O·
120" 73;33- 73:21" .,. 86; ,. 90;54- 62; O·
90' 43:33" 43;42- SS' 56:33" 60:59" 32; O·
60' B:33" 13:23" 18' 20:27" 23:26" '; O'
5. Conclusions
Besides the obvious conclusion that the attributions of methods to authors
in astrology are not always reliable, we have also seen an example of how
a single method can generate a variety of procedures by way of
transmission through different authors. This is the case of the accounts for
the Single Hour Line method for the projection of rays found in al-Biriini,
Abii Macshar and the version of the latter in Ibn CAzziiz. If the motivation
for compiling his tables was the lack of precision of the procedure when
dealing with stars in the western hemisphere, Ibn cAzziiz could have
spared himself this effort if he had known al-Biriini's description for the
Ibn 'AWl, al-Qusan!rnr'S Ulbles for computing planetary aspects 75
same method, because this version takes into account oblique descensions
when necessary. Nevertheless, thanks to the imperfection of the version
available to rbn CAzzuz, we have the only known preserved case of a table
for the Single Hour Line method for the rays and we can check the results
that an astrologer could obtain using this tables.
The comparison with the data obtained with other methods leads to
another conclusion: considering the differences found using one method
or another, the choice of a satisfactory procedure is not a trivial question
from an astrologer's point of view. Notwithstanding, for our
interpretations, the problem is that there is not always evidence in the
sources of the authors' awareness of subtleties like the degree of
approximation reached using hour lines with respect to the use of position
circles, nor of the differences using one method or another. Together with
a tradition that distinguishes methods that use hour lines (attributed to
Ptolemy) from those using position circles or semicircles (attributed to
Hermes) there seems to be another tradition that understands the use of
hour lines as an approximation to the use of position circles or
semicircles. In this sense, it is difficult to assert whether these traditions
emerged in parallel or were generated by confusion, and to what extent
the astrologers were conscious of the fact that the two sets of systems
belong to different geometric models. Moreover, Ibn cAzzuz's proposal
of performing the projection of rays following the Simple Ecliptic method
and using his tables for the tasyrr gives a clear example of the application
of a single method to different astrological practices without any
theoretical justification and without heeding of the numerical consequences
and astrological implications. This example contributes to strengthen the
conviction expressed by North in 199656 that one of the causes for the
cross-fertilization between the methods is the availability of a given
instrument (in this case, a table) that one tends to use for different
purposes.
56 Cf. North, "A reply". 582.
76
AKNOWLEDGEMENTS
J. Casulleras
Professors Benno van Dalen, lan P. Hogendijk and Julio Sams6 h.ave read a previous draft
of this paper and made very useful suggcslions. I would like 10 express my gratitude to them.
This paper has been prepared within a research programme on "The evolution of Science in
al·Andalus' Sociely from the Early Middle Ages to the Pre·Renaissance", sponsored by the
Spanish Ministry of Science and Innovation (FFI200S-D02)4/FILO) and the European
Regional Development Fund (ERDF).
7. Bibliographical references
Martin, Astrollomia: F. Marlin As!n, Astronomia, Madrid, 199<Y.
aI4
B1riini, Qdnun: AM Rayl)an al-BTrOni, AI-QOtlllll al-Marlldf, 3 vols.,
Hyderabad: Osmania Oriental Publications Bureau, 1954-1956.
Bouche-Leclerq, Astr%gie: A. Bouche-Leclercq, L'asrrologie grecque.
Paris, 1899. Reprint in Brussels, 1963.
Calvo, "Resolution graphique": E. Calvo, "La resolution graphique des
queslions astrologiques a al-Andalus", Hisroire des Marhemariques
Arabes: Acres dll r Col/oque Maghrebin sur I'Hisroire des
Marhemariques Arabes. Tipaza. Alger, Algerie. 1-3 Decembre 1990,
AIger: Association Algerienne d'Histoire des Mathematiques, Ecole
Normale Superieure, 1998,31-44.
Casulleras, "Aspectos": J. Casulleras, "El calculo de aspeclOs 0 la
proyecci6n de rayos en la astrologia medieval arabe", Archives
1fllernatiollales d'Hisroire des Sciences, 57, no. 158 (Juin, 2(07), 25-
46.
Casulleras, "Ibn Mucadh": 1. Casulleras, "Ibn Mucadh on the ASlfological
Rays", Sl/lIayl, 4 (2004), 385-402.
Djebbar, "Quelques elements": A. Djebbar, "Quelques eU:ments nouveaux
sur !'activile mathemalique arabe dans le Maghreb Orienlal (lXe -
XVIe s.)". Deuxieme Col/oqlle Maghrebin sur I'Hisroire des
Marllemariques Arabes, Tunis, 1998.
Ibn cAzzuz a l - Q u s a n ~ [ n r ' s rabies for computing planetary aspects 77
Dorce, Tay al-Azyay: C. Dorce, El Tay al-Azyay de Mu}!yf al-Dfn al
Magribf, Barcelona, 2002-2003.
al-HashimI, Reasons: cAli b. Sulayman al-HasimI, The Book of the
Reasons behind Astronomical Tables, trans. by F.I. Haddad and E.S.
Kennedy, commentary by D. Pingree and E.S. Kennedy, New York,
1981.
Hogendijk, "Applied Mathematics": J.P. Hogendijk, "Applied
Mathematics in Eleventh century al-Andalus: Ibn Mucadh al-Jayyani
and his computation of astrological houses and aspects", Centaurus, 47
(2005), 87-114.
Hogendijk, "Progressions": J.P. Hogendijk, "Progressions, Rays and
Houses in Medieval Islamic Astrology: A Mathematical Classification",
paper delivered at the Dibner Institute Conference, New Perspectives
on Science in Medieval Islam, Cambridge, Mass., 6-8 november,
1998.
Hogendijk, "Seasonal Hour Lines": J.P. Hogendijk, "The Contributions
by Abii N a ~ r ibn CIraq and a l - ~ a g h a n i to the Theory of Seasonal Hour
Lines on Astrolabes and Sundials", Zeitschrift fUr Geschichte der
Arabisch-Islamischen Wissenschajten, 14 (2001), 1-30.
Hogendijk, "Two Tables": J.P. Hogendijk, "The Mathematical Structure
of Two Islamic Astrological Tables for "Casting the Rays"",
Centaurus, 32 (1989), 171-202.
Ibn Abi-I-Rijal, Libro Conplido: Aly Aben Ragel, El Libro Conplido en
los ludizios de las Estrellas. Traducci6n hecha en la corte de Alfonso
X el Sabio, introduction and edition by G. Hilty, Madrid, 1954.
Ibn Hibinta, Mughnf: Ibn Hibinta, The Complete Book of Astrology. Al-
Mughnf fi a ~ k t i m al-nujum, facsimile edition by F. Sezgin, 2 vols.,
Frankfurt, 1987.
Kennedy, "Houses": E.S. Kennedy, "The Astrological Houses as Defined
78 J. Casulleras
by Medieval Islamic Astronomers", J. Casulleras and J. Sams6 (eds.),
From Baghdad to BarcelonaSrudies in the Islamic Exact Sciences in
Honour of Pro! Juan Vemet, 2 vols., Barcelona: Universital de
Barcelona· Ins(i(u(o "MillAs Yallicrosa" de Historia de la Ciencia
Arabe, 1996,2: 535-578. Reprint in E.S. Kennedy, Astronomy and
Astrology ill the Medieval/slamic World, Aldershot, Variorum, 1998,
no. XIX.
Kennedy, "Ibn Mucadh": E.$. Kennedy, "Ibn Mucadh on the Astrological
Houses", Zeitschrift fUr Geschichre der Arabisll-Islamischen
Wissencha/ten, 9 (1994), 153-160. Reprint in E.S. Kennedy,
Astronomy and Astrology in the Medieval Islamic World, Aldershot,
Variorum, 1998, no. XVI.
Kennedy & Krikorian, "Rays": E.$. Kennedy and H. Krikorian-Preisler,
"The ASlrological Doclrine of Projecling lhe Rays", Al-Abhath, 25
(1972), 3-15. Reprint in E.S. Kennedy, colleagues and former
sludenls, Studies ill the Islamic Exact Sciences, Beirul, 1983,372-384.
Lemay, AM M a ~ s h a r : Abii Matshar, Kittib al-Mudkhal al-Kabir ili'l ri/m
a
~
l
k
t
J
m
al-IIujlim. liber 11llroductorii Maioris ad scientiam jlldicorllm
astrorllm, crilical edition by Richard Lemay, 9 vols., Napoli, 1995.
There is also a facsimile ed. by F. Sezgin, Frankfurt, 1985.
Lorch, Farghti/lr: al·FarghanT, On the Astrolabe. Arabic Text Edited with
Translation alld CommellIary by Richard Lorch, Wiesbaden: Franz
Sleiner Verlag, 2005, 5, 10, 60-63.
Ptolemy, Tetrabiblos: Ptolemy, Tetrabiblos, edited and translated by F.E.
Robbins, Cambridge Mass., 1940, reprint in 1980 (Loeb Classical
Library, 435).
North, "A reply": LD. North, "A reply to Prof. E.S. Kennedy ", 11, J.
Casulleras and J. Sams6 (eds.), From Baghdad to BarcelollaStudies ill
the Islamic Exact Sciences i1/ Honour of Pro! Jua1l Vemet, 2 vols.,
Barcelona: Universital de Barcelona - Instituto "Millas Vallicrosa" de
His{oria de la Ciencia Arabe, 1996, 2: 579-582.
lbn <Au12z al-Qusan!fnf'S tables for compUling planetary aspects 79
North, "Horoscopes": J.D. North, Horoscopes and History, London,
1986.
crus, Catala & Nuiiez, Astronomia esjerica: J.J. de crus Navarro, M.A.
Catala Pocb and J. N6iiez de Murga, Astronomia esjerica y mecanica
celeste, Barcelona, 2007.
Ptolemy, Tetrabiblos: C. Ptolemy, Tetrabiblos, translated by F.E.
Robbins, Cambridge, 1940, reprint in 1980 (Loeb Classical Library,
435).
Rico, Libros: M. Rico (ed.) Libros del Saber de Astronomia del Rey D.
Alfonso X de Castilla, 5 vols., Madrid 1863-1867.
Sams6, "al-BTriinT": J. Sams6, "«al-BTriinI» in al-Andalus", From Baghdad
to Barcelona, Il, 583-612. Reprint in Sams6, Variorum 2007, no. VI.
Sams6, "Astronomical observations": J. Sams6, "Astronomical
observations in the Maghrib in the fourteenth and fifteenth centuries" ,
Science in Context, 14 (2001), 165-178. Reprint in Sams6, Variorum
2207, no. XII.
Sams6, "Horoscopes": "Horoscopes and History: rbn cAzziiz and his
Retrospective Horoscopes related to the Battle of El Salado (1340)",
L. Nauta y A. Vanderjagt, eds., Between Demonstration and
Imagination, Leiden, 1999, 101-124. Reprint in Sams6, Variorum
2007, no. X.
Sams6, "rbn CAzzuz": J. Sams6, "Andalusian Astronomy in 14th Century
Fez: Al-Zl) al-Muwafiq of rbn cAzziiz al-QusantTnT", Zeitschrift fUr
Geschichte der Arabisch-Islamischen Wissenchajten 11 (Frankfurt,
1997), 73-110. Reprint in Sams6, Variorum 2007, no. IX.
Sams6, "MaghribT Zijes": J. Sams6, "An outline of the history of
MaghribT zijes from the end of the thirteenth century", Journaljor the
History oj Astronomy, 29 (1998), 93-102. Reprint in Sams6, Variorum
2007, no. XI.
80 1. Casulleras
Sams6, "ZaCUl'S Almanach": J. Sams6, "In Pursuit of Zacut's Almallacll
Perpetuum in the Eastern Islamic World", Zeitschrijt jiir GeschicJue
der Arabisch-lslamischen Wissellschajrefl, 15 (2002-2003), 67-93.
Riprint in Sams6, Variorum 2007, no. XVI.
Sams6, Variomm 2007: J. Sams6, Astronomy and Astrology in al-Alldalus
and the Maghrib, Ashgale: Variorum Collected Studies Series, 2007.
Sams6 & Berrani, "al+lsliji": J. Sams6 and H. Berrani, "The Epistle on
Tasyfr and the projection of rays by Abu Marwan al-Istiji", Suhayl, 5
(2005), 163-242.
Sams6 & Berrani, "World astrology": J. Sams6 and H. Berrani, "World
astrology in eleventh-century al-Andalus: the Epistle on Tasyfr and tbe
Projection of Rays by al-Istijji", Joumal of Islamic Srudies, 10:3
(1999),293-312. Reprint in Sams6, Variorum 2007, no. V.
Sezgin, GAS: F. Sezgin, Geschichre des Arabisc!len Schriftru11ls bis ca.
430 H., 9 vols., Leiden, 1971-1984.
Ibn <Aau, a l - Q u s a n ~ [ n r ' s tables for computing planetary aspects 81
Appendix 1. Translation of the text attached to the tables
[428] Chapter on knowing the projection of rays, the tasyir of the stars
and the division of the houses.
You must know that, on the projection of rays, there are many
methods. The best method and the most correct of what is said [on this]
is what was mentioned by Ptolemy and Hermes. This is what Abii
Macshar transmitted on the procedure for the rays taken from Ptolemy, it
is the method used by the people nowadays. Abii Macshar said: if you
want to make the rays of any star you wish from the ascensions, establish
the ascendent and the tenth [house], and fmd the equivalent to the degree
of the star in equal equatorial degrees (daraj aL-sawa' min aL1aLak al-
mustaqim). Take what corresponds to it in ascensions and add [or
subtract] to this, 60 for the sextile, 90 for the quartile, 120 for the trine;
look for what corresponds to your sum [or subtraction] in right ascensions
and transform it into ecliptical degrees. The result is the ray of the star
using right ascensions, keep your final [eciiptical] degree. Then, do the
same [as before] using oblique ascensions: if you found the ray of the star
using right ascensions and using [also] oblique ascensions, and both rays
agree within a single minute, this is the equalized ray of the star. [429] If
the two [rays] diverge, subtract the smaller one from the larger one in
ecliptical degrees [taken from the position] of the star and call this the
difference between the two rays. Then, find the hours of distance from the
star to the degree of the tenth [house], if it is above the earth, or its
distance in hours to the degree of the fourth [house] if it is below, using
right ascensions. This means that you take the ascensions of the degree of
the tenth [house] and the ascensions of the degree of the star, if it is above
the earth, and you do the same with the ascensions of the fourth [house]
and the ascensions of the star, if it is below. What you obtain is the
distance of the star to the cardine (aL-watad) If the star is in the south-
eastern quadrant [of the sphere] or in its nadir, which is the north-western
quadrant, divide the distance of the star to the cardine by the length of a
seasonal diurnal hour of the degree of the star (azman darajat naMr aL-
kawkab). If the star is in the south-western quadrant or in its nadir, which
is the north-eastern quadrant, divide the distance to the cusp by the length
of a seasonal nocturnal hour of the degree of the star (azman darajat
LayLat aL-kawkab). The result in hours and their parts, if there is any
82 J. Cl.'lulleras
fraction, is the hours of the distance. Then, divide the first difference by
six parts and multiply the result by [430] the hours of the distance to the
cardine; what results is the equation. Next,look at the Tay oftbe SlaT that
you found using right ascensions. If it is smaller in degrees and closer to
the position of the star lhan the ray that you found using oblique
ascensions, add the equation 10 the ray thal you found using right
ascensions. If the ray that you found using right ascensions is larger in
degrees and further from the position of the star than the ray that you
found using oblique ascensions. subtract the equation from the ray that
you found using right ascensions. The result, after its addition or
subtraction, is the equalized ray. This is the method of the wise people in
our days. In this procedure, there is some approximation if the star is in
che two eastern quadrants, and a great flaw if the star is in the two
western quadrants. The error happened to those who came before [us],
among the Ancients, wich the rays just because they found the rays
following Ptolemy and Hermes using right and oblique ascensions,
esLablished their system on these two ascensions, and neglected the two
western quadrants, they did not see that any ecliptical sign that rises with
a known number [of ascensions] sets with the ascensions of its nadir. For
this reason, they were entirely wrong concerning the rays when the star
is in the two western quadrants. This [431] is because the resulting
degrees of the equation are ecliptical degrees (mustawiya) and what is
required for correctness is that the resulting degrees of the difference
between the two rays be radial ecliptical degrees ( J z f ~ i y y a mustawiya)S'.
We have made tables for the projection [ ... ] of the rays for the
latitude of Fes, compare [it] with that. [This is] the shape of my work: I
put in the first [column of the table] the ecliptical degrees of the sign in
which the star is, in its second [column] the ascensions of the midheaven,
in its eighth [column] the oblique ascensions, in its ninth the length of the
seasonal hours of the place. Following, I intended [to work with] the
(first] degree of Aries, I took its corresponding right and oblique
11 This last expression seems 10 refer 10 the use of radial aJulUiOlU for obtaining positions
on the ecliptic. In the sense that Ibn Mlf:idh al-JayylinT uses the expression. these radial
ascensioIU are projections OnlO the equalor of ecliptical poims using incident horizons
or aproximations 10 lhese using hour lines. Wllat the text calls radial ecliptical degrees
may be points on the ecliptic obtained by using the same procedure inversely. Cr.
Casulleras, "Ibn Mlflldh-, 391-392.
Ibn rAzzuz al-Qusan!£nf's tables for compuring planetary aspects 83
ascensions [ '" ] and subtracted the smaller of it from the larger, being
the remainder on the equator, I divided it in six parts, which are the hours
of distance between [each one of] the two horizonss8 and the midheaven.
I called the result equation of the difference of the distance of one
seasonal hour from the midheaven. Then, I wrote down the ascensions of
one degree of Aries in two places, subtracted the equation of the
difference of the distance of one seasonal hour from one of them, and
added it to the other, the remainder of the subtraction being the ascensions
of the distance of one seasonal hour from the midheaven towards the
eastern horizon [432], and the total of the addition the ascensions of the
distance of one seasonal hour towards the western horizon. I wrote down
each one of them [Le. of the two results] in the table for the distance of
the first hour from the midheaven on the side that I found suitable. Next,
I multiplied the equation of the distance of the hour by two and subtracted
it from the right ascensions in one of the two places and added it in the
other, the remainder of the subtraction being the ascensions of the distance
of two seasonal hours from the midheaven towards the eastern horizon,
and the total of the addition the ascensions of the distance of two seasonal
hours from the midheaven towards the western horizon. I did the same
until completing the distance of six hours from the midheaven towards the
eastern side and six hours towards the western side. This was the
procedure: the ascensions of the distance of the sixth hour from the
midheaven to the eastern side are the [oblique] ascensions of the place,
and the ascensions of the distance of the sixth hour to the western side are
the [oblique] descensions of the place, which correspond to the nadirs of
the ascendent degree. This way, I put the ascensions corresponding to one
degree and to two degrees of the sign of Aries, [and so on] until the end
of the sign. If the oblique ascensions had been larger than the right
ascensionss9 we would have divided this difference between them in six
parts, then, we would have put [433] the right ascensions in two places
and added one of the six parts to one of the two places and subtracted
from the other, the total of the addition would have been the ascensions
of the distance of one seasonal hour from the midheaven towards the
sa That is, the eastern part of the horizon and its western part.
59 This happens when the sign of o(}..) is negative. that is, for A > 180 0
•
84 J. Casullens
eastern side, and the remainder of the subtraction the ascensions of the
dislance of one seasonal hour towards the western side. When I did this.
fI considered] the stars projecting rays (al-kawdkib al·shiftfiyya) on both
sides from the midheaven and I knew that every hour that has its distance
from the midheaven towards the western side is equivalent to another hour
whose distance from the midheaven is towards the eastern side, that the
degrees of the descensions of the western hour are equivalent to the
degrees of the ascensions of the eastern hour, and that one of the (WO
hours takes the place of the other like the ascendent and its nadir, [the
ascendent] rising with the descensions that its nadir has in the western
quadrant. [Consequently] I [only] wrote down the ascensions of the six
eastern hours, for each one of the western hours corresponds to one of the
eastern hours, since its distance is the same, like the western sixth [hour
corresponds} to the eastern sixth [hour], the western fifth to the eastern
fifth, [434] the fourth to the fourth, the third to the third, the second to
the second and the western first to the eastern first, the midheaven is right
ascensions, there is no deviation in it.
We made these tables for projecting the rays at the latitude of Fes. If
you want to work with these tables and the degree of the star is in one of
the two eastern quadrants, whose center is the center of the ascendent, you
must know the hours of the distance of the star from the ascendent. To
know this you take the ascensions of the ascendent degree and the
ascensions of the degree of the star, [both taken] as right ascensions, and
subtract the smaller from the larger. The remainder is the distance of the
degree of the star from the ascendent degree. You divide this by the
length of one diurnal seasonal hour of the degree of the star, if it is above
the horizon, and by the length of one nocturnal seasonal hour of the star,
if it is below the horizon. The quotient that you obtain will be the hours
of distance from the eastern horizon. You do the same with the ascensions
of the degree of the descendent and the ascensions of the degree of the
star, if it is in the two western quadrants, the distance of the star from the
degree of the descendent is divided by the length of one diurnal seasonal
hour [435] of the star, if it is above the horizon, and by its nocturnal
seasonal hour if it is below the horizon. The quotient will be the hours of
distance from the descendent. When you know the hours of the distance
of the star, on whichever side it is, using these procedures, look for the
eclipticaJ degree that corresponds to the degree of the star in the sign in
which it is on the page that has as a header "ascensions of ..... the sign of
/bn <AzzuZ al-Qusan!fnf's rabIes for computing planetary aspects 85
the star. Take what corresponds to ascensions in the table of the hours of
the distance of the star from the eastern horizon and apply to it [that is,
add to it or subtract to it, depending on whether you want a right or a left
aspect] for the sextile 60, for the quartile 90, and for the trine 120, then
look for what corresponds to the total amount on the next pages, in the
sequence of the signs, in the columnw of the hours of the distance of the
star from the eastern horizon, where you reach the [entry of the table]
corresponding to the number you have, transform it into ecliptical degrees
[using the table inversely]. The result is the ray of that star. If the star is
in the two western quadrants, whose center is the western horizon, look
in the ecliptical degrees for what corresponds to the degree of the star in
the sign it is on the page that has as a header "descensions of ... " the sign
of the star, and determine its distance from the western horizon [and go
on with the procedure] as explained above. Where your computation
finishes, transform it into ecliptical degrees. The result is the ray of that
star.
If there are any fractions with the hours and you want to adjust them,
enter in another complete hour and take the difference between the two
[hours] and determine the ratio of the fractions of the hour to its whole.
If the ray of the first complete hour is smaller than the ray of the added
[hour], add the adjustment of the fractions to the ray of the complete
hour. If it is larger, subtract it. The result will be the equalized ray.
Most people in our days believe that these rays are the places of the
lights of the stars in its own shape but I believe that the star only projects
its rays for the sextile at [a distance ot] 600 , for the quartile at 90 0 , and
for the trine at 1200 in ecliptical degrees, and the rays of these stars are
only in ecliptical degrees. This is my method and my conviction, and the
fruit of these tables is in the tasyfr of the stars among themselves and in
[determinig] the value of the [arc ot] tasyfr of one specific degree towards
another degree which is known by the tasyfr, God, the Almighty, willing.
God gives success to what is right61 •
60 Sa{r, not in the sense of "line" but meaning "column" or "series of numbers".
61 This same expression is used by Ibn tAzzUz at the end of his introduction to the Zl]. Cf.
J. Sams6, "Ibn tAzzUz" , 78, n.18.
86 I. CasulleR$
Appendix 2. Edition of the Arabic text
......... . . , . s l ~ ~ • . : . . . . . : . ~ I ~ J u . . . "'_ .;. .;.-:. [428]
.
~
~
I
·1!-i. _1411 ~ I . , ~ _I:" . : . . . . . : . ~ I ~ J u . . . . ; . .,) F1
~
VJ ~ ~ i ~ L . 1 ~ j ' V - ~ J I,)'IJt_"h: Q . " s ~ L. J : ! J l i ~ 1
~
.
)
)
1
~
1
..,..:........ ~ i JU .t:.:.L..) JAi ~ ~ """'3'_' Ih: Uo' . . . : " l . ~
l.J.t ~ L. ~ J I'M;· !I ·'1 ~ w-.- I l l ~ ~ . ) ~ ~ ~ , . s . n ~ . ) . )
J:.,.. ~ I J ~ ''''_''''-'', ~ ~ . , , : o . J J J " " ' - " " " : ! ~ ~ .:IjJ ~
W . I ~ I t . . ) . : I ~ ~ ~ J ~ . t - > J 1'_';; ".11 ~ I ~ ~ . w ~ Le
~
1 ~ I [J.>JI. ,'_ ,- "," .ill>.I1 ~ u . . . . , ..,..5..sJ1 tu...:..... [ ~
tu...:. . : . i ~ 1;1' .>J,JI ~ .!lJ; J:.. J.>OI . ~ ~ I . " ~
"
;
.
!
;
.
:
I
~
U
l
.
L
a
.
.
.
:
J
I
~
;
'
'
'
i
I
J
~
~
J
r
.
:
;
-
,
.
I
I
~
~
~
,
s
.
n
·
J
l
~
I
.
,
.
.
.
.
.
l
.
i
L;J;.;..I .:>!. [429J J. . . . . . . J I . . , . . 5 ~ tu...:. .... .!lJ:.i '.>.>1 •
..:...... ~ t.. ~ .:. ~ I. ..,..5;S.U 'I...-JI [J'';' . " s ~ I .;,.
~
J
.
:
I
~
~
,
.
s
.
n
.1.S..:I 6 3 ~ L L L... Io..ljL I ~ ~ ~ l L L a . . . : J l l J . : . ! Le ~ ~ I
015 ul ~ I ~ ~ J . : I 0-4 6ol Li l.d...... ~ ,i u A J ~ 1 1.5'" 015 01 ~ W I
~
W
l
~
J
.
:
I
~
l
.
J
g
"
"
.
~
I
.
:
:
i
u4 ~ ~ J (_ it !I ·11 ~ I ~ ~ uAJ'it1 ~
61 I. 1l. . ' ~ I _ ~ " M S . . . J I - = - - ~ .. "-"I ~
-' -.....- .,-- - -.....- IS
lbn rAzzuZ al-Qusan!fnl's tables for computing planetary aspects 87
~
I
y
l
~
~
J.U.i ~ ~ ~ ~ J ~ I J;J wLS w1 ~ ~ , ~ J ~ ~ U - ~
0-' ~ ~ I ~ ~ ~ ~ ~ W ~ J ~ I ~ wLS w1 ~ ~ I ~ U - ~
~
~
I
Q
~
~
~
j
w
~
~
l
w
~
~
,
~
y
l
~
~
~
,
wLS w ~ ~ ~ I
wL..) u-l* ~ ~ , 0-' ~ ~ , ~ ~ u ..~~l " ~ . . , . s J 1 ~ y l .,...
~
j
..~~I ..~ . .,.sJ1 ~ y l ~ ~ ~ I wLS w 1 ~ ~ ~ I J ~ < ~ J ~ >
u-l* ~ ~ , 0-' ~ I ~ u " ~ ~ I " ~ ~ 1 ~ Y l . , . . . ~ ~ I Q ~ ~
'"p wLS w 1 L A J ~ ~ ~ ~ l . . - J I 0-0 ~ ~ W ~ ~ , A.4J ~ J ~ wL..)
4
q
~
j
~
u-l* J ' " . J ~ I ~ ~ ' l t l ~ I ..~ . ~ I ~ l . & . L . . u ~ ~
.
J
:
!
~
I
~
~
W ~ ~ I 0-' ~ , ~ l . & . L . . u [430] ~ ~ . . - ; . ' ~ ~ W
w
L
S
w
~
(_,d; ,lit 11 ~ l ~ ~ cl>, ~ ~ I ~ ~ I t ~ ~ 1 ~ I ' " ~
~
~
~
>
'
~
~
I
tl..s.,jJ1 0-0 ~ ~ I ~ , . . ~ 1 ~ ; ! j ~ ~ J ~ '"Jli
wh (_,d; ,. ..11 ~ l ~ ~ ~ > ' ~ ~ I tl..s.,jJ1 u-l* J : ! ~ I .)j.J ~ I
0-' ~ i . J ~ J ~ . , ; . . s i (J;; fltll ~ I ~ ~ ~ > ' ~ ~ I 6 5 t L . s . . . : J 1 wLS
J
:
!
~
l
~
u
~
I
~
~
~
>
'
~
~
I
tL.s...:J1 0-0 ~ ~ I ~ , . .
~
[
~
I
~
I
.
o
~
]
(_,;; '"oil ~ l ~ ~ ~ > ' ~ ~ I tL.s...:J1 660-0
~
~
~
~
I
~
~
.
J
'
"
~
I
tl..s.,jJ1 ~ ~ wL-..i:J1 ~ i ~ o.)4jJl
~
y
l
~
~
~
I
wLS 1 ~ 1 ~ ~ ~ J.o.s.II I ~ ~ . J ~ L . . j J.ai
~
~
l
o
:
I
1
~
w_,'".:!..,.sJ1 ~ y l ~ ~ ~ I wLS 1 ~ 1 ~ b ~ w _ , ' " _ , . ~ 1
0-' ~ l.&. L.s...:J1 I ~ ~ ~ ~ ~ ~ l . & . ~ I ~ J:! 1 ~ ' i ' 1 0-0 (w ~ ~ ..bJ..iJ1
65 t ~ 1 MS ~ , . u ; ; J 1
66 I omit ~ ~ ~ . ; - ., ell .!.I..WI tu...:. because this seems to be an error of the copyist.
88 J. Casulleru
~
~
l,..uU t-,j- ,.n r.!Jh..nj ~ ~ r . . J O W ~ ' V"Ji_'h:
c>< 'J5 ',) I . ~ 1"'" ",'".,.ul """,.,JlI,Jlli. ""Ih,' " ' ~
V-- " ~ ~ ~ ~ "l ~ ~ . ~ ~ ~ >.&.:! "'::'J r,.a... . u . ~ ~
~
J
.
:
a
·ui [431] c l I ~ J . ~ . . , . a J 1 ~ . , > J I ~ ~ , s J l wlS loiJ ~ ~ L . s . . . : J 1
u
~
"I ",'»1 ~ .,."I,JI ........... toO ~ t ~ ... :.II j,.-..n
.
~
~
~
t.-:. ~ 6 : J . : a ~ L.a...:.J1 "":')1.;.>1 u-e t.Ju...n t . . J ~
~
~
""I> ~ . , . . J ~ ~ L...:J1 [ ... J t ou...J J.I...,. ~ ....
~
w
~
1
J
~
t
.
~
.I,.....n t.J.:aJJil ~ ~ ~ i.),..., .clI.i
~
..... .;,.ol:.Jl .... • L.-J1 ........ ~ l:.JI .... .,.s.sn
~
~
~
.
)
~
I
~
~
.
~
~
e,,1.£.L..., uL.) ~ ~ 1 ~ J 6 1 ~
[ ... J .>J,)I ~ . f, " ". ~ I < ~ u . . . > .;,.0 L , J ~ L. ~ » . i .
~
.'. ,,'i r, " ,,11 "-lI.ilJ J..A>JI , , ~ ~ I .;,.0 'JHI " d· •
.• L..-JI J....,JJ ~ i l ~ Lt ~ ~ ~ L . . . t ~ ~ ' I ~ t ~
.
'
~
J....,J ~ •• .!',L.j ul-u ~ . . . . . l ~ 1 ~ ~ r.Ju...n ,- ./' "J
.i.c. L,.." ~ ...J.:!.1.&.:i ,- 0'" J ~ ) l J ~ ...J..-..I1 u..- ~ J.:l ~ -=..Jj:a i .~
~
~
...... ua,.......n w ~ ~ W J ~ "u.JIjJ ~ ~ i u..- .w_"L..,j
ol;,.JI "IS. [432J : ... ...:.n ...~ I ~ .t...JI ........ ~ ",.L.j""L..
~
_I. 'J5 ~ . > o l . '",.,.ul ~ I uJl ;'"L.j"L.. _ ~ ~
1.o'...,.• .,:.Jl "-W1'" .t...J1 ~ u J . ~ I ..L...J1 _ J • ...,. ...
., ..tJ..JI MS ,_ i' , e N ~ , I follow the table. whjch contains oblique ascensions in the
Clghlh column, for Ihis COIT«:lion .
.. "'L... MS;"':'L; "'L... with ~ L ; cros:scd 001.
Ibn cAzzt1z al-Qusan!rnr's tables/or computing planetary aspects 89
~
I
~
U
-
l
J
.
4
~
~
'
·
t
,
o
;
·
,
.
9
~
'
~
A...l.wJ1 ~ J . : ! ~ ~ ~ w ~ . u
~
U
-
.
u
.
o
U
G
~
1
wlS.J ~ ~ I ~ . u . 3 j . 9 ~ ~ 1 ~ i ~ t.';; ... 11
~
.31j.&J1 WIS.9 w ~ . , > - J J I ~ ~ l ~ 1 ~ ~ I .J-.u.9 ~ ~ L u ~
~
~
~
.
9
w
~
.
>
-
i
J
1
~
~
I
~
1
~
~
I
.J-.u.9 ~ ~ \ . . . . , ~ ~ U
~
b
~
1
.u.o ~ ~ I .J-.u.9 ~ ~ I . . \ " ' " W..:.......u ~ ~ ~ i ~
~
~
U
-
:
~
I
l.u wlS.J . ~ ~ I ~ b ~ 1 69w..:.......u.9 ~ ~ I
7
0
~
'
~
U
-
~
~
,
~
b
~
1
~
~
I
.J-.u.9 ~ 4..u.3l.wJ1 A...l.wJ1
~
~
I
~
'
~
I
~
J\.i.o ~ ~ I ~ b ~ 1 4..u .3l.wJ1 A...l.wJ1 ~ ~ U - . 9
lJ.4 ~ J . 3 . 9 ~ J . 3 J ~ L. ~ U - ~ ~ ~ . 9 4.&JLbJI ~ J ~ I 71 ~
~
I
~
U
-
lJ.4 ~ i ~ , ~ U - WIS ~ . 9 .~ . . w l ~ T ~ l ~ I ~ . > !
[433] ~ w ~ ~ , ~ i ~ ~ ~ J..4.4.'1 l.u ~ '1"':;; '" .11
~
j
~
~
I
r
~
~
1
~
j
b.3j.9 ~ , . . ~ 1".';; l I . I I ~ ' ~ U
;...\...., ~ ~ U - ~ .31j.&J1 w ~ wlS.J ~ l : J I l J . 4 O ~ . 9 ~ ~ I
~
~
U
-
.u.o U G ~ I . 9 . ~ ~ I ~ b ~ 1 ~ ~ , .J-.u.9 ~ ;;w.u L.j
~
~
l
.
.
a
.
.
J
J
'
~
'
~
1
o.u ~ L : . . J . 9 ~ ~ ' ~ b ~ l ~ L . j A . . . \ " ' "
~
I
A
~
w
~
A...\"", wJ5 w w i ~ . 9 ~ ~ I .J-.u.9lJ.4 ~ I w ~ i
,J-.i.9 ~ lA ~ ~ ~ i A...l.wJ 4.:!.91....Y..o ~ ~ , ~ b ~ 1 ~ ~ I ~ . 9
4.:!.91....Y..o ; ; w . ~ > i J 1 A...L..J1 ~ J \ . i . o ~ J . 3 wwi.9 ~ ~ I ~ b ~ l ~ ~ l
69 -..:...... MS z;;....,
70 ~ I M S ~
71 ~ M S p l . . l i . : .
90 J. Casulleras
1
S
.
»
~
1
rw r ~ ~ l - J l i o $ ~ l · r . ) ' .".:i..,...:..J1 .u.WI ~ ~ J ~
.::.J;,:. j• .-if' ~ 10'.,)1 ..:..<JI ........ " " . J ~ ~ '" ~ I ......... ~ L S
;
·
~
~
.
;
-
A
J
I
~
~
L
.
.
J
I
w.-.u.L...."'J.S ~ 1 . ; ; " ~ . ~ 1 1 . : . t ~ L . . . . , " ~ l ~
1.:l.>IJ I..., LA..., wLS ~ ! ; ; ' ' ' _ i ~ l ~ ~ W l w.-- i.LL....J ~ U
.........~ ,ji"' ~ .. .".aJI ......... 6..11 J ji"'.:;..".....:.JI 4...." ~ L . . . i . l I ;;._ ~ . " . a J 1 .4......".:Il.-J\.S
~
.
~
I
.
""1iJ) ..,.t:.JI. ~ ;,:.)t:.JI. u,1.,JJ u,1.,)1. [434] '·,I.,.:.!I
"i r-;- ".11 ..!.J.Wl ~ , . . .L.......JI ~ . H ;;"'.:i",..:J1 uJ.!SU ;;"'.!..".aJI
.
~
7
2
~
~
1
l
~
!
-
J
.!J"u vA.>S- ~ ..:" ~ La..:J1 t. Ju.-J J J I ~ 1I.i.It L....a...4.J ~ . J
~
.
>
!
I
~
j
~
~
,
s
J
1
~
J
~
~
L
S
J
J
J
I
~
I
.
~
J..u.II ":".3)
,
,
"
,
.
,
.
.
s
~
..., uL<.L.. FU ~ U o J I ;,SjA ~ ; , S j A " , ~ I w"""'.,.:.!1
.... . , . . s ~ I ' ; , . , ~ . ~ U o J I ' ; , . , . I 1 ~ ~ i : ; wi .w;, __ ....... .~I
.:.... . , . . s ~ 1 ..., ,.:. """ w > - 5 ~ 1C>o "Jl ~ I .........,. r" '" ".!I ..u.J1
~
i
l
J':' wLS wl ~ , s J 1 J ~ ~ J . 3 w L . ) ~ ,. ",-;. ~ I ' ~ I
V-- ..w ~ ~ W ~ ' i ' 1 ..:....-:i wLS 01 ~ , 1 J l ~ ~ . ) . ) uL.) ~ J
JU' .w:>s. .-",.,.:.!I ~ ~ I .:.... . , . . s ~ ..., u L<. L.. ,.:. 4..:&)1
w.e
_u.i.ll ~ . . , J I ~ wLS 1 ~ ! ~ , 1 J l '.R ~ J I..;-t.;WI • ~ ~
.;L,;:. [435] ~ J . ) 0L.) ~ 7 3 ~ J W I ~ J . ) Wo' ~ , . s J 1 ..., ~ J
W ~ ' i ' 1 ~ wLS 01 ~ ~ . ) . ) wLe) "'"' J ~ ' i ' l J':' wLS 0! ~ , s . J 1
Ibn rAzzuz al-Qusan![nf's tables for computing planetary aspects 91
-U.:' ~ ~ L . . . . , ~ , ~ ~ 7 4 ~ J W ' ~ ~ ~ I -U.:' ~ ~ L . . . . , ~ ~ . »
7
5
~
1
~
1
~
J
.
)
w
~
i
~
~
I
.
.
t
J
L
.
.
.
.
~
1
o
~
IJLS ~ w ~ i ~ ~ ~ I
~
t
,
.
.
.
:
.
~
1
~
I
~
~
~
~
~
I
~
.
x
J
'
~
~
~
I
~
J
.
)
~
~
~
L
.
.
.
.
,
J
~
~
~
~
u
.
-
J
I
~
.
u
~
L. » . ~ ~ ~ l ~ ~ ~ u . - 4.o.ui J
uQ ~ > U J ~ LP U I ' - : ! ~ ~ ~ I ~ w~.,>-JJI ~ ~ , ~ ~ ~ I ~
~
~
~
I
~
6
-
;
'
I
O
"
~
~
~
~
I
~
~
I
w
~
~
'
'
'
,
_
,
I
'
;
j
t
l
~
~
w
~
.
,
>
-
J
J
1
~
~
I
~
~
~
I
-U.:' ~ ~ L . . . . , ~ ~ ~ . ! . x J 1 ~ I ~
~
IJLS LoS ~ I ~ I ~ J . ) ",,",I ~ w ~ ~ ~ ~ I .).uJ1 ~ ~ i
~
~
,
1J.t_,!.,>-i.J1 ~ . } l ~ ~ ~ l IJLS 1 J 1 ~ ~ ~ l ~ ~ tl.s...t
~
~
~
I
~
J
.
)
~
~
I
.
,
.
.
.
.
J
I
~
J
.
)
~
~
I
.
.
t
,w~ . ;-iJ1 ~ ~ I L.6A.)S..>-O
~
~
YJLi.o 764.o.uiJ ~ t , . . . : . ~ 1 ~ l ~ ~ ~ ~ ~ , ~ ~ I
~
~
I
~
r
W
~
t..s w ~ . ; - i J 1 ~ ~ I ~ 0-U.:' ~ J - ' I ~ ~ ~ l
I
~
~
'
~
~
tl.s...t ~ IJLS LoS ~ I , - J I ~ J . ) """'1 4 . o . u w ~ .).uJ1
A:...LJ lS.;.>i 4 . . . ~ J>.)1..t ~ . . u . : i ~ . ) ) ~ ~ ~ ~ L . . . J I ~ I J L S I J ~
IJLS 1Jl-:t ~ ~ 4...L...J1 ~ ~ 1 . . : t J - ' 1 ~ ~ L. ~ » . ~
~
I
L.k..u.:i .).;s o ~ IjJI t l.s...t ~ W S! i " , , " , ~ ~ I A:...WI 4... L...JI t l.s...t
tL.s...:JI ~ ~ LoS ~ ~ I ~ i IJLS 1 J 1 ~ A:...WI4...L...J1 tl.s...t ~
. JW.u..J1
75 Iomit.;- I,If ~ I . ' ' ' ' '(- ~
92 J. Casl,llleras
.)I,:.i ~ I , . . . L;::ai ~ l . c . L . •••~.n .:u ~ U J ~ U:iL.j JAi ~ j J
"",,.....-JJ "'" L...:, t: ~ ~ . , . . s ~ 1 .,;,i ""-' i b i. ~ i .". . , . . s 1 ~ 1
o.u ~ l . c . ~ L..::iJ, "1,...,..J1 ~ . . J ~ ~ -11 ,.or.: I ' ; ~ ", w A ~ ! ~ . . " . . . u J : ; ; ~ !
VJ J J I ~ I • ..i.. • ."...sJ l J . 3 l . L o . L I J ~ . \ . e I ~ ,.I,...,..J1 t . . ) ~ . . . , . . . s 1 ~ 1
- '1- -,._- -.<.. 'I" ~ - · . . . . 5 1 · < ' 1 -~.)~U"'·4e""""'~J~~r~J~IJ".~·,.- ~
.
~
I
·
·
"
'
·
'
-
-
'
I
.
u
n
' .• .un-!..>·I A ..... '_ . . j. , . - ~ , . - J U""'''- U. ~ ~ " " - I S ~
Table of the ascensions of Aries and the descensions of Libra >
in hours of distance with respect to the eastern horizon "Cl
~
(
~
~
I
~
'
i
'
1
~
~
I
~
t
.
.
L
.
.
,
~
w
l
~
1
yJLi.o.t J,.-Il ~ U - J . t ~ ) =~
A hour 0 hour 1 hour 2 hour 3 hour 4 hour 5 hour 6 hour length W
ditt. ' ditto ditto ditto ditto ditto ditf. ditto ~ ~
1 0;55 0;52 0;49 0;46 0;44 -1 0;41 -1 0;39 15; 3 e: ;:,
- €2 1;50 1;45 1;29 +11 1;34 +1 1;28 +2 1;23 +2 1;18 15; 6 -1 ...Q
3 2;45 2;37 2;29 2;21 2;13 2;46 -41 1;37 +20 15; 8 = 1::,
N
4 3;40 3;29 3;19 -1 3; 8 -1 2;57 -1 2;46 -1 2;36 15;11 ll:I l:)
5 4;35 4;22 4; 8 +1 3;55 +1 3;42 +1 3;28 +2 3;15 15; 13 = .,..
Co to
6 5;30 5; 14 4;58 4;42 4;26 4;10 3;54 15;16 .., ~
7 6;25 6; 6 +1 5;48 +1 5;29 +2 5;11 +2 4;52 +3 4;34 15;18 +1 ~
8 7;20 6;58 +1 6;37 +1 6; 16 +1 5;55 +1 5;53 -18 5; 12 +1 15;21 Q .§
8 ....
9 8;16 7;52 7;27 +1 7; 3 +1 6;39 +1 6;14 +2 5;51 +1 15;24 ",-
10 9;11 8;44 8;17 7;50 7;23 6;56 6;30 +2 15;27 "Cl Q
= "'"11 10; 5 +1 8;34 +63 9; 6 +2 8;37 +2 8; 8 +2 7;38 +3 7; 9 +2 15;30 -1 S- ~
12 11; 0 +2 10;28 +2 9;58 9;25 +1 8;53 +1 8;22 7;49 +2 15;32 et. ~
13 11;56 +1 11; 21 +1 10;47 10;12 9;38 -1 9; 4 -2 8;29 +1 15;35 -1 Q ...
= g
14 12;51 +1 12;12 +3 11 ;37 +1 11; 1 10;23 +1 9;46 +1 9; 9 +1 15;37 Q '"15 13;47 +1 13; 7 +1 12;27 +1 11 ;47 + 11; 8 10;28 9;49 +1 15;40 .... '6
I::
16 14;42 +2 14; 0 +2 13; 17 +3 12;35 + 11;53 +3 11;11 +3 10;29 +1 15;42 er S·
17 15;39 14;59 -5 14; 9 13;24 12;39 11;54 11; 9 +1 15;45 ~
00
.",
18 16;35 15;47 14;59 14;11 13;20 +3 12;36 -1 11;49 +1 15;48 S- is';:,
19 17;31 16;40 +1 15;51 15; 0 + 14;10 +1 13;20 +1 12;30 15;51 -1 r:::1' ~
- Q
20 18;27 17;34 16;41 15;48 14;55 14; 2 13; 10 +1 15;53 ~ ~ Cl)
21 19;23 18;28 17;32 +1 16;56 -1 15;41 +2 14;46 +2 13;51 15;55 t;
22 20;19 19;21 18;23 17;25 16;27 15;29 14;32 15;58 'I::i
~
23 21;15 +1 20;14 +1 19;14 18;13 17; 13 -1 16;12 -1 15;12 +1 16; 0 ....
c:
24 22;12 21; 9 20; 6 19; 3 18; 0 16;57 15;54 16; 3
25 23; 8 +1 22; 2 +1 20;57 19;51 18;46 -1 17;40 -1 16;35 +1 16; 6
26 24; 5 22;57 21;48 +1 20;40 + 19;32 +1 18;24 +1 17;16 +1 16; 8
27 25; 2 23;52 22;41 +1 21;30 + 20;19 +3 19; 8 +4 17;58 +1 16; 11
28 25;59 24;45 +1 23;32 +1 22;19 + 21; 2 +5 19;53 +1 18;40 +1 16;13 \0
29 26;26 +30 25;55 -15 24;24 23; 8 21;52 20;37 -1 19;22 +1 16;16 w
30 27;53 26;34 +1 25; 16 +1 23;58 + 22;40 +1 21;22 +1 20; 4 +1 16; 18
1 For the recomputation and comparison of the tables I use the computer program Table Analysis ITA) developed by B. van Dalen at the Institute
for the History of Science (Frankfurt a. M.). I give manuscript values and differences with the recomputation.
Ascensions of Taurus and descensions of Scorpius 'f
in hours of distance with respect to the eastern horizon
<.,.,..,.:.JI ~ ' i l ~ .....,JI ~ 1 . L.. ..,. y ~ 1 yJu.., J,:.JI !!!Jo...)
, hour 0 hour 1 hour 2 hour 3 hour 4 hour 5 hour 6 hour length
diff. diff. dlff . diff. diff . diff. diff. di ff.
J1 28;50 -, 27;29 -, 26; 9 24;48 23;28 -, 22; 7 -, 20;47 -, 16;20 -,32 29;48 28;25 27; 2 25;39 24; 16 22;53 21;30 -, 16;23
" 30;46 29;20 -, 27;35 +21 26;29 - 25; 4 -2 23;38 -, 22; 13 -, 16;26 -,34 31;43 -, 30;15 -, 28;47 -, 27;19 - 25;51 -, 24;33 -. 22;56 -, 16;28
35 32;41 -, 31; 11 -, 29;40 -2 28;10 - 26;40 -2 25; 9 -, 23;39 -, 16;30
36 33;40 32; 8 -, 30;35 -, 29; 2 27;30 -2 25;57 -2 24;25 -, 16;33
37 34;38 33; 3 31 ;28 29;53 28;18 26;43 25; 8 16;35
,. 35;36 -, 33;59 -, 32;22 -, 30;44 - 29; 7 _2 27;29 -, 25;55 -2 16;38 -,,. 36;35 34;55 33; 15 31;35 29;56 -, 28;16 -, 26;37 16;40 ~
40 37;34 35;52 34; 10 32;28 30;46 29; 4 27;22 16;42
f41 38;33 36;49 35; 5 33;21 31;30 _7 29;52 -, 28; 7 -, 16;45 -,42 39;32 37;45 35;58 34; 11 32;25 -, 30; 18 -,. 28;52 -, 16;47 -,43 40;31 -, 38;42 -, 36;54 35; 4 - 33;15 -, 31;26 -, 29;37 _2 16;49
44 41;30 -, 39;39 -, 37;48 -, 35;57 - 34; 6 -, 32;15 -, 30;24 -, 16;51
" 42;30 -, 40;37 -, 38;44 -, 36;50 - 34;48 +11 33; 5 -, 31; 12 16;53
" 43;30 -, 41;35 -, 39;40 -, 37;45 - 35;50 -, 33;55 -, 32; 0 -, 16;55
47 44;30 -, 42;32 -, 40;35 38;37 36;40 -, 34;52 -11 32;45 -, 16;58 -,48 45;30 -, 43;30 -, 41;30 -, 39;30 - 37;30 -, 35;31 33;32 -2 17; 0
4. 46;31 44;29 42;27 40;25 38;24 -, 36;22 -, 34;21 -, 17; 2
" 47;31 -, 45;27 -, 43;24 41; 19 - 39;15 -, 37; 11 -, 35; 8 -2 17; 4
51 48;32 -, 46;26 -, 44;20 -, 42; 14 - 40; 8 -, 38; 2 -, 35;57 -2 17; 6
S2 49;34 47;25 -, 45; 17 -, 43; la 41; 2 38;54 36;47 -, 17; 8
53 50;34 -, 48;24 -, 46; 15 44; 4 - 41 ;55 39;45 37;36 -, 17;10
54 51 ;36 49;25 47; 13 -, 45; 1 - 42;49 -, 40;37 _4 38;26 -, 17; 12
" 52;37 -, 50;23 -, 48; 10 45;56 43;43 -, 41 ;29 -, 39;16 -, 17; 14 -,56 53;39 51 ;24 49; 9 46;53 - 44;37 _2 42;27 -, 40; 7 -, 17; 15
57 54;41 52;23 -, 50; 6 -, 47;49 - 45;32 -, 43; 15 -, 40;58 -, 17;17
" 55;43 53;24 51; 5 48;46 45;27 +60 44; 8 41;50 17;19
5. 56;46 -, 54;24 52; 3 49;43 47;22 -, 45; 1 -, 42;41 -, 17; 21
.. 57;47 -, 55;24 -2 53; 2 -2 50;40 - 411;17 -, 45;55 -, 43;33 _2 17;22
Ascensions of Gemini and descensions of Sagittarius
in hours of distance with respect to the eastern horizon
(
~
~
I
~
~
I
0-' ~ I ~ ~ L . . . i ~ ~ " " " YJLi..., ~ l j ~ 1 ~ )
.l. hour 0 hour 1 hour 2 hour 3 hour 4 hour 5 hour 6 hour length
diff. diff. diff. diff. diff. diff. diff. diff.
61 58;50 56;26 54; 2 51;38 49;14 46;50 44;26 +1 17;24 C;:
62 59;53 57;28 -1 55; 3 -2 52;39 50;14 -5 47;48 -5 45;25 -5 17;26 -1 "- €63 60;56 58;29 56; 2 53;36 - 51; 6 +2 48;46 -5 46;13 +1 17;27
64 61;59 59;30 +1 57;42 -39 55; 3 -2 52; 9 -2 49;42 -3 47; 8 17;29 $:,
N
65 63; 2 60;32 58; 2 55;32 53; 2 50;33 -1 48; 2 +1 17;30 t>
...
66 64; 5 +1 61;33 +2 59; 2 +2 56;30 + 53;59 +3 51;27 +4 48;56 +1 17;32 -1
~
67 65;13 -4 62;36 60; 3 57;30 54;57 52;25 -1 49;52 +1 17;33
68 66;13 63;38 +1 61; 4 +1 58;30 + 55;56 +1 53;22 +1 50;48 +1 17;35 -1 "·s
69 67;18 -1 64;41 +1 62; 6 +1 59;30 + 56;55 +2 54;19 +3 51;46 -1 17;36 -1 ...",'
70 68;21 65;44 63; 7 60;31 - 57;54 -1 55;17 -1 52;42 -1 17;37 is
71 69;25 66;47 64; 9 61;31 58;58 -5 56;14 +1 53;38 +1 17;38 ~
'""72 70;29 67;50 65;11 62;32 59;53 57;14 54;35 +1 17;39 '"
73 71;33 68;53 66;13 63;33 60;53 58;13 55;33 +1 17;40 '(s>.,
74 72;38 69;56 +1 67;15 +1 64;34 + 61;53 +1 59;12 +1 56;35 -2 17;41 8
75 73;42 71; 0 68;18 65;36 62;52 +2 60;12 57;30 +2 17;42 .@
76 74;47 72; 6 -2 69;22 -1 66;39 - 63;56 -1 61;13 -1 58;30 +1 17;43 ;:
77 75;52 73; 8 70;24 67;41 - 64;57 -1 62;14 -2 59;30 +1 17;44 S·
""78 76;57 74; 12 +1 71;28 +1 68;43 + 65;59 +2 63; 14 +3 60;30 +1 17;45 -1 ~
79 78; 2 75; 16 +1 72;32 69;46 + 67; 1 +1 64;16 +1 61 ;31 +1 17;45 i>
"80 79; 7 76;21 73;36 -1 70;50 - 68; 4 -1 65;18 -1 62;30 +3 17;46 '"is
81 80;12 77;25 +1 74;39 +1 71 ;52 + 69; 6 +2 66;19 +3 63;33 +1 17;47 -1 ~
82 81; 17 78;30 75;43 72;56 70; 9 67;22 64;35 +1 17;47 ~
83 82;22 79;34 +1 76;47 +1 73;59 + 71; 15 -1 68;24 +3 65;37 +2 17;48 -1 '"'"84 83;28 80;40 77;52 75; 4 72;16 69;25 +3 66;40 +2 17;48 t;;
85 84;32 +1 81;44 +1 78;56 +1 76; 8 + 73;19 +2 70;31 +2 67;48 -3 17;48
86 85;38 82;49 +1 80; 1 +1 77; 12 + 74;21 +5 71;35 +3 68;47 +2 17;48
87 86;43 +1 83;54 +1 81; 6 78;17 75;28 72;39 69;51 +2 17;49 -1
88 87;49 85; 1 -1 82;12 -1 79;23 - 76;34 -1 73;45 -1 70;56 +1 17;49
89 88;54 +1 86; 5 +1 83;16 +1 80;28 77;38 +1 74;49 +1 72; 0 +2 17;49 \0
90 90; 0 87;11 84;22 80;33 +6 78;44 75;55 73; 6 +1 17;49 VI
Ascensions of Cancer and descensions of Capricorn
in hours of distance with respect to the eastern horizon
<..,..,..:.JI .... ~ I ~ .....,n ~ L . . L . . ....... .-n ...Ju... wu..-n!iU--)
:l':
-53
-54
-60
.10
-so
-10
[
2"
hour 2 hour 3 hour 4 hour 5 hour 6 hour length
dlff_ diff. diU. dift. diU. diU. diU.
+2 85;27 82;39 79;50 -1 77; 1 -1 74;12 +1 17;49
86;34 -1 83;45 80;56 -1 78; 7 -1 7'5;18 +1 17;/'9
87-39 -1 84'50 82· 2 -2 79·13 -2 76'22 +3 17·/,9 -1
88;46 85;57 + 83; 9 +1 80;20 +2 77;32 17;/,8
89-51 87· 3 84·14 +1 81'27 78-39 17-48
90;56 88; 3 + 85;21 -1 82;33 -1 79;46 +1 17;48
+1 92; 6 -2 89;15 + 86;28 +2 83;40 .3 80;53 +1 17;48 -1
93; 9 90;22 87;35 84;/'8 82; 1 +1 17;47
+1 94;15.1 91;28 + 88;42 +2 85;59 -1 83; 9 +2 17;47 -1
-1 95-22 -1 92-39 89·50 -1 87· 4 -1 84'18 .1 17·46
.1 96;27 +1 93;42 + 9<1;57 +1 88;12 .1 85;27 +1 17;46 -1
+1 97;34 +1 94;49 • 92; 5 .2 89;20 .3 86;36 +2 17:45 -1
+1 98;41 +1 95;56 • 93;13 +3 9<1;29 .4 87;47 17;44
-1 99;48 -1 97; 5 94;22 -1 91;39 -1 88;56 +1 17;43
100;54 98;12 95;30 92;48 9<1; 6 +1 17;42
-1 102- 0 99'20 96-39 -1 93-58 -1 91·17 17·41
1
0
3
~
7 100;27 97;57 -10 9'5;50 -43 9 2 ~ 2 7 1 7 ~ 4 0
+10104;13 101;36 98;55 96;16 93;37 +1 17;39
-1 105-20 -1 102-42 100- 4 -1 97-26 -1 94-48 .1 17·38
-6 106;26 -1 103;49 101;12 -1 98;16 -2 95;59 +1 17;37
107;32 +1 104;57 + 102;21 +2 99;46 .2 97;10 +1 17;35
108;39 106; 5 103;31 100;56 +1 98;22 .1 17;34
109;44 +1 107;13 104;40 -1 102; 7 -1 99;34 17;33
+1 110;51 +1 108;20 + 105;49 +1 103;18 +1 100;46 17;32-1
111;58 109;28 106;58 104;28 101;58 17;31-1
+8 113; 3 110;36 108; 7 -2 105;39 -3 103;10 17;29
114;11 -1 111;23 +2 109;16 106;49 104:22 17;27
-1 115;16 -1 112;51 110;22 +1 108; 0 -3 105;34 17;26-'
-2116;21 +1 113;57 + 111;23 +11 109; 9 +1 106;46 .1 17;25 -1
117;28 116; 6 -6 112;44 110;22 107;59 17;22
88; 14
89;22
90;27
91;34
92;39
93;44
94;50
95;56
97; 1
98; 8
99; 12
100;18
101;24
102;31
103;36
104;42
105;47
106;42
107;58
+8 109; 8
-10 110; 8
+8111;13
-2 112;18
113;22
114;28
115;24
116;37
117;42
118;48
119;50
" hour 0 hour 1
diff .
91 91; 5
92 92;11
93 93; 16
94 95;22
95 95;17
96 96;32
97 97;38
98 98;43
99 99;48
100 100;53
101 101;58
102 103;53
103104;18
104 105;13
105 106; 18
106 107;22
107 108;27
108 109; 9 +22
109 110;35
110111;31
111 112;53
112 113;39
113 114;53
114 115;54
115116;58
116118;54
117119;58
118120; 7
119121; 9 +1
120 122;\2
Ascensions of Leo and descensions of Aquarius
in hours of distance with respect to the eastern horizon
(
~
.
"
.
.
:
a
J
1
~
i
l
Uo' ~ l ~ L c . L - ~ , J ~ l ~ J u . . ~ ~ i l ~ )
). hour 0 hour 1 hour 2 hour 3 hour 4 hour 5 hour 6 hour length
diff. diff. diff. diff. diff. diff. diff. diff.
121 123;15 121 ;55 -61 118;34 -1 117;13 -6 114;53 -62 111;30 109;11 17;21 <;:
122 124;17 121;59 -1 119;40 -1 117;21 - 115; 5 -4 112;43 -1 110;24 17; 19 '"
123 125;19 123; 1 +1 120;44 +1 118;27 + 116;10 +1 113;53 +1111;36 +1 17; 17 §
124 126;21 124; 5 +1 121;50 +1 119;35 + 117;20 +1 115; 5 +1 112;49 17; 15 '"N
125 127;23 -1 125; 9 122;56 120;46 - 118;29 +1 116;15 +2 114; 2 17; 14 -1 l:>.,.
126 128;24 126;12 +1 124; 1 +1 121 ;49 + 119;18 +22 117;26 +3 115;15 17; 12
~
127 129;26 -1 127;16 -1 125; 6 -1 122;56 - 120;47 -2 118;37 -2 116;28 17; 10
128 130;27 -1 128;19 -1 126; 11 -1 124; 3 - 121;56 -2 119;48 -2 117;41 17; 8 '"
129 131 ;28 -1 129;22 -1 127;16 -1 125;10 - 123; 4 -1 120;58 -1 118;48 +5 17; 6 ·s....
130 132;29 -1 130; 25 -1 128;21 -1 126;17 - 124; 14 -2 122;10 -2 120;46 -40 17; 4 ",-
is
131 133;29 131 ;27 129;26 -1 127;23 125;22 -1 123;20 -1 121;19 17; 2 ""132 134;30 -1 132;30 -1 130;30 -1 128;30 - 126;31 -2 124;31 -2 122;32 17; 0 ~
'"133 135;30 -1 133;33 -1 131;36 -1 129;39 - 127;41 125;44 123;46 -1 16;58 -1 '(s>
134 136;30 -1 134;35 -1 132;40 -1 130;45 - 128;50 -1 126;45 +9 126; 0 -62 16;58 -3 ...
8
135 137;30 -1 135;37 -1 133;44 -1 131 ;51 129;58 -1 128; 5 -1 126;12 -2 16;58 -5 ~
136 138;29 136;38 134;47 132;56 131; 5 129; 14 127;24 -1 16;51 ;::
137 139;28 137;40 -1 135;51 -1 134; 2 - 132;13 -1 130;24 -1 128;31 +5 16;49 S·
138 140;28 138;40 +2 136;53 +3 135; 6 + 133; 19 +5 131 ;35 +3 129;45 +4 16;47 -1 ..,
~
139 141;27 139;42 +1 137;58 +1 136;14 + 134;29 +2 132;41 +6 131; 1 +1 16;45 -1 El
'"140 142;26 141;44 -60 139; 2 137;20 135;38 133;56 132;14 16;42 '"is
141 143;25 142;45 -60 140; 5 138;25 136;46 -1 135; 6 -1 133;27 16;40 ~
142 144;23 143;47 -61 141;10 -1 139;33 - 137; 55 136; 18 134;40 -1 16;38 -1 ~
143 145;22 144;47 -60 142;12 140;37 139; 2 137;27 135;52 16;35 '"144 146;20 144;47 143;16 -2 141;43 - 140;10 -2 138; 18 +17 137; 5 -1 16;33 '"!:;
145 147;18 145;48 144;19 -1 142;49 - 141;18 139;48 138;17 16;30
146 148;16 146;49 -1 145;22 -2 143;55 - 142;26 -2 140;58 -2 139;30 -1 16;28
147 149; 14 147;49 146;24 144;58 + 143;32 +2 142; 7 +2 140;41 +1 16;26 -1
148 150;12 148;49 147;25 +1 146; 2 + 144;39 +1 143;16 +1 141 ;54 16;23
149 151; 9 149;49 148;29 147; 9 145;48 +1 144;28 +1 143; 7 -1 16;20 +1 1.0
150 152; 7 148;49 +120 149;31 148;12 + 146;54 +1 145;36 +1 144; 18 16;18 ~
Ascensions of Virgo and descensions of Pisces
'"in hours of distance with respect to the eastern horizon 00
<.... .,.:.n ....il C>L ....n ~ ~ L . . . .... ~ ~ "'Ju... ~ !!1Jo...)
, hour 0 hour 1 hour 2 hour J hour 4 hour 5 hour 6 hour length
diff. diff. diff. diff. diff. di ff. diff _ di ff.
151 153; 4 151;48 150;32 149; 17 148; 1 -1 148;45 -121 145;30 16;16
152 154; 1 152;48 151;36 -1 150;22 149; 9 148;55 ·59 146;42 16; 3 .10
153 154;58 153;47 152;36 151;25 150;15 -1 149; 4 -1 147;54 16; 9 .,
154 155;55 154;45 .2 153;39 152;31 151;23 150;14 .1 149; 6 16; 8
155 156;51 155;41 .4 154;41 -, 153;36 152;30 -3 151;20 .1 150;39 -21 16; 5 .,
156 157;48 156;45 155;42 154;39 153;36 152;33 151;30 16; 3
157 158;44 157;45 -1 156;44 155;44 154;43 .1 153;42 .2 152;42 16; 1 -,
158 159;41 158;48 -5 157;45 156;47 155;50 -1 154;52 -1 153;34 .19 15;58
159 160;37 159;42 158;47 157;41 ., 156;56 .1 156; 0 .2 155; 5 15;55
160 161;33 160;41 -1 159;48 -, 158;55 158; 2 -1 157; 9 ·1 156;16 .1 15;53
161 162;29 161;39 160;48 ., 159;58 • 159; 8 .1 158;18 .1 157;28 15;50 n
•162 163;25 162;37 161;49 161; 2 160;14 -1 159;26 -1 158;29 .'1 15;48 0
163 164;21 163;36 162;51 162; 6 161;21 160;36 159;51 15;45 ~ ,164 165;16 164;34 163;51 ., 163; 9 • 162;27 .1 161 ;45 .1 161; 3 -1 15;42 •
165 166;12 165;32 164,52 164; 13 163,34 -2 162;54 -2 162;15 -, 15;40
166 167; 8 166;31 165;54 165;17 164;40 164; 3 163;26 -1 15;37
167 168; 3 167;29 166;55 166;20 • 165;46 ., 165;" .2 164;37 -1 15;35 -,
168 168;58 168;27 -1 167;55 -, 167;23 166;52 -2 166;20 -2 165;48 -1 15;32
169 169;54 169;25 168;56 168;27 168;58 -60 167;27 .2 166;59 15;30 -,
170 170;46 .3 170;53 ·30 169;57 169;30 • 169; 3 .2 168;37 .2 168;10 15;27
171 171;44 171;21 -1 170;46.'0 170;33 170; 9 -1 169;45 -1 169;21 15;22 .,
172 172;40 172; 19 171;58 171;36 • 171;15 ., 170;54 .1 170;32 15;21
173 173;35 173; 16 172;57 172;39 In;20 -1 172; 1 ·1 171;43 15; 18 .,
174 174;30 174;14 173;58 173;42 173;24 ·2173;10 172;54 15; 16
175 175;24 .1 175;12 174;59 174;45 • 174;32 .1 174;18 .2 174;35 -30 15; 13
176 176;20 176; 9 175;58 175;48 175;37 -1 175;27 -2 175;16 15;11
In In;15 In; 7 176;59 176;51 176;43 176;35 176;27 15; 8
178 178;10 178; 5 In; 0 .60 177;54 • In;49 .1 In;43 .2 In;38 15; 6 -,
179 179; 5 179; 2 178;59 178;57 178;52 .1 178;52 -2 178;49 15; 3
180 180; 0 180; 0 180; 0 180; 0 180; 0 180; 0 180; 0 15; 0
Ascensions of Libra and descensions of Aries
in hours of distance with respect to the eastern horizon
(
~
~
I
~
i
l
0
-
'
~
I
~
t
.
.
.
l
.
.
i
~
J,.>JI ~ J L a . . . J 0 1 ~ 1 ~ U - )
.l. hour 0 hour 1 hour 2 hour 3 hour 4 hour 5 hour 6 hour length
ditto ditto ditto diff. diff. diff. diff. diff.
181 180;52 +3 180;56 +2 181; 0 +1 181; 4 181; 5 +2 180; 8 +62 181;11 14;55 +2 ~
182 181;50 181;55 182; 1 -1 182; 6 - 182;15 -5 182;17 -2 182;52 -30 14;54 +1 :::s
183 182;45 182;53 183; 1 183; 9 183;17 183; 9 +16 183;33 14;52 ~
184 183;40 183;51 184; 1 +1 184;12 + 184;22 +2 184;33 +2 184;44 14;49 l:o
N
185 184;35 184;48 185; 2 -1 185;15 - 185;29 -2 185;42 -2 185;55 14;47 l:>
186 185;30 185;46 186; 2 186;18 186;34 186;50 187; 6 14;44 ....
187 186;25 186;44 187; 2 +1 187;21 + 187;39 +2 187;58 +2 188;16 +1 14;42 -1 ~
188 187;20 187;41 188; 3 -1 188;24 - 188;46 -2 189; 7 -2 189;28 14;39 :::s
189 188;15 +1 188;39 +1 189; 3 +1 189;27 + 189;51 +1 190; 15 +1 190;49 -10 14;34 +2 '§
...
190 189; 11 189;37 190; 4 ·1 190;30 - 190;57 -2 191;23 -2 191;50 14;33 .,.
191 190; 6 190;35 191; 4 191;32 + 192; 3 -1 192;22 +9 193; 1 14;30 +1 is
~
192 191; 1 +1 191;33 +1 192; 4 +2 192;36 + 193; 8 +2 193;40 +2 194;12 +1 14;28 '".,
193 191;57 192;30 +1 193; 5 193;39 194;14 ·1 194;48 -1 195;23 +1 14;25 +1 '0>
194 193;52 -60 193;29 194; 6 194;43 195;20 195;57 196;54 -19 14;23 .,
8195 194;44 ·56 194;27 +1 195; 7 +1 195;46 + 196;26 +2 197; 5 +3 197;45 +1 14;20 ~
196 195;44 -60 195;25 +1 196; 8 196;50 197;33 -1 198;15 -1 198;57 +1 14;18
197 196;39 -60 196;24 197; 9 197;54 198;29 +10 199;24 200; 9 14;15 ~ .
198 196;55 -20 197;23 198;10 +1 198;58 + 199;46 +1 200;34 +1 201;21 -1 14;12 Cl<>
'1::l
199 197;31 198;21 199;11 200; 1 200;52 -1 201;42 -1 202;32 14; 9 +1 is'
:::s
200 198;27 199;20 200;13 201; 5 + 201;58 +1 202;51 +1 203;44 - 1 14; 7 ~
201 199;23 200;18 201;14 -1 202; 9 - 203; 5 -2 204; 0 -2 204;55 14; 5 is
~
202 200;19 201;17 202;15 203; 12 + 204;10 +1 205; 8 +1 206; 6 +1 14; 2 ~
203 201;15 +1 202; 16 203; 16 204;17 - 205;17 -1 206;18 -2 207;18 13;59 +1 "<:i
~
204 202;12 203;15 204;18 205;21 206;24 207;27 208;30 13;57 '"t;;
205 203; 8 +1 204;14 +1 205;19 +2 206;25 + 207;30 +3 208;38 +1 209;45 -3 13;52 +2
206 204; 5 205;13 206;21 207;30 - 208;38 -1 209;46 -1 210;54 13;52
207 205; 2 206; 13 207;23 +1 208;54 -1 209;44 +2 210;59 -2 212; 6 13;59 -10
208 205;59 207;12 208;24 +1 209;39 - 210;52 -1 212; 5 -1 213; 18 13;47
209 206;56 208;12 209;28 210;43 + 211;59 +1 213;15 +1 214;30 13;44 \0
210 207;53 209;11 210;29 211;47 213; 6 -1 214;24 -1 215;42 13;44 -2 \0
Ascensions of Scorpius and descensions of Taurus
in hours of distance with respect (0 the eastern horizon 8
(
"
"
;
~
I
'
;
:
'
~
I
.
:
>
L
.....,JI " , , ~ L . . " " ; .J,:JI-"'.JwJ - , . . ~ I ~ )
• hour 0 hour 1 hour 2 hour 3 hour 4 hour 5 hour 6 hour length
diff. diff. diff • ditto diff • di ff. di ff. di ff.
211 208;51 210;51 '40211;31 212;52 214;12 • 1 215;24 +7 216;33 +21 13;39
212 209;48 211; 4 +7 212;29 ·5 213;57 215;58 -38 216;43 218; 6 13;36 .,
213 210;46 212; 11 213;37 -, 215; 2 216;28 -2 217;53 ·2 219;19 -, 13;34 .,
214 211;43 +1 213;11 +1 214;38 ., 216; 6 + 217;34 +2 219; 2 +2 220;30 ., 13;32
215 212;41 +1 214;11 +1 215;42 217;12 218;43 -1 220;13 -1 221;43 13;30
216 213;40 215; 12 +1 216;45 ., 218;17 + 219;50 +2 221;22 +3 222;55 ., 13;27
217 214;38 216; 13 217;48 219;23 220;46 +12 222;33 224; 8 13;25
218 215;36 +1 217;13 +1 218;51 220;28 222; 6 -1 223;43 -1 225;20 ., 13;22 .,
219 216;35 218; 15 219;54 ., 221; 34 + 223; 13 +2 224;53 +2 226;33 13;20
220 217;34 219; 16 220;58 222;40 224;22 226; 4 227;46 13; 18 ~
221 218;33 220;17 222; 2 -, 223;46 225;31 -2 227;15 -2 228;59 -, 13;16 n
222 219;32 221;19 -1 223; 5 -, 224;52 226;38 -2 228;25 -3 230;12 -, 13;13 ., ~
223 220;31 +1 222;20 +1 224; 9 ., 225;57 + 227;46 +2 229;35 +2 231;24 13;11 "224221;30 +1 223;21 +1 225;12 ., 227; 3 + 228;54 +' 230;45 +1 232;36 ., 13; 9 ,225 222;30 +1 224;23 +1 226;16 ., 228; 9 + 230; 2 +1 231;55 +1 233;48 ., 13; 7
226 223;30 +1 225;25 +1 227;20 ., 229;15 + 231; 10 +1 233; 5 +1 235; 0 ., 13; 5
227 224;30 +1 226;27 +1 228;25 230;22 232;20 -1 234;17 -1 236;14 ., 13; 2 .,
228 225;30 +1 227;30 229;29 231;29 233;28 -1 235;28 -2 237;28 13; 0
229 226;31 228;33 230;35 232;36 + 234;37 +2 236; 19 +22 238;41 12;58
230 227;31 +1 229;35 +1 231;38 ., 233;42 + 236;46 -58 237;50 +2 239;54 12;56
231 228;32 +1 230;38 +1 232;44 ., 234;49 + 237;55 -58 239; 1 +2241; 7 12;54
232 229;33 +1 231;41 +1 233;48 ., 235;56 + 238; 3 +3240;12 +2 242; 19 12;52
233 230;34 +1 232;44 +1 234;53 ., 237; 3 + 239;12 +3241;22 +3 243;32 12;50
234231;36 233;47 235;59 -, 238; 10 - 240;22 -2 242;23 +8 244;45 12;48
235 232;37 +1 234;50 +1 237; 4 239;17 241;31 -, 243;44 -1 245;58 12;47
236 233;39 235;54 238; 10 -, 240;22 + 242;41 -2 244;56 -2 247; " 12;45
237 234;41 236;58 239;16 -, 241;33 - 243;50 -, 246; 7 -1 248;24 -, 12;43
238 235;43 238; 2 240;21 242;40 244;58 +1 247;17 +1 249;36 12;41
239 236;45 239; 5 +1 241;26 ., 243;46 + 246; 7 +2 248;28 +2 250;49 12;39
240 237;47 +' 240; 9 +1 242;32 244;54 247;17 -1 249;39 ., 252; 1 12;38
Ascensions of Sagittarius and descensions of Gemini
in hours of distance with respect to the eastern horizon
(
~
.
"
.
.
.
:
J
I
~
i
l
0-' ~ I ~ ~ Lw, ~ " j ~ ' l..:-'Jl.i.o.j l . J " ~ 1 ~ U - )
.l. hour 0 hour 1 hour 2 hour 3 hour 4 hour 5 hour 6 hour length
ditto diff. ditto ditto ditto ditto ditto ditto
241 238;50 241; 14 243;38 246; 2 248;26 250;55 -5 253;14 -1 12;36 <5:
242 239;53 242; 18 +1 244;44 +1 247; 9 + 249;35 +2 252; 1 +2 254;25 +1 12;36 -1 ::::
243 240;56 243;23 245;50 248;18 - 250;45 -1 253;12 -1 255;39 -1 12;36 -3 ~
244 241 ;59 244;28 246;56 +1 249;24 + 251;53 +2 254;22 +2 256;50 12;35 -4 $::'.
N
245 243; 2 245;32 248; 2 250;32 253; 2 255;32 258; 2 12;33 -3 s:::.
246 244; 5 +1 246;36 +1 249; 8 251;39 254;11 -1 256;42 -1 259;14 12;31 -2
t247 245; 9 247;42 250;15 252;47 + 255;20 +1 257;53 +1 260;26 12;30 -3
248 246; 13 248;47 251 ;21 253;56 - 256;30 -1 259; 6 -3 261;38 -1 12;28 -2 ::::
.§
249 247;17 249;52 252;28 -1 255; 3 - 257;39 -2 260;15 -3 262;30 +19 12;27 -2 ..,
250 248;20 +1 250;56 +1 253;34 -1 256;10 - 258;47 -2 261;24 -3 264; 1 -1 12;26 -3 ",'
is
251 249;25 252; 3 254;40 +1 257; 18 + 259;56 +1 262;34 +1 265;12 -1 12;24 -2 ~
252 250;29 253; 18 -10 255 ;47 258;26 261; 5 263;44 266;23 -1 12;23 -2 ~
'"253 251;33 254;13 256;53 259;33 262;13 264;53 267;33 12;22 -2 ~ ~
254 252;37 +1 255;18 +1 257;59 +1 260;40 + 263;22 265; 2 +61 268;43 12;21 -2 8
255 253;42 256;29 -5 259; 6 261;48 264;30 267;12 269;54 -1 12;20 -2 ~
256 254;47 257;30 260;13 262;55 + 265;38 +1 268;21 +1 271; 4 -1 12; 19 -2 §.257 256;52 -60 258;36 261;21 -1 264; 3 + 266;46 +2 269;30 +2 272;14 -1 12; 18 -2 ""258 259;57 -180 259;41 262;26 -1 265;10 - 267;55 -2 270;40 -3 273;24 -2 12; 17 -1 "l::l
259 260; 2 -120 260;46 +1 263;23 +9 266;18 - 269; 2 271 ;48 -1 274;33 -1 12; 16 -1 is"
::::
260 261; 7 -120 261;53 264;38 +1 267;24 + 270;10 +1 272;56 +1 275;42 -1 12;15 -1 '"is
261 262;12 -120 262;58 265;45 -1 268;24 + 271;18 -2 274; 5 -3 276;51 -2 12;15 -1 ~
262 263;17 -120 264; 4 266;51 269;28 +1 272;25 275; 12 277;59 -1 12;14 -1 {l
263 264;22 -120 265; 9 267;56 270;45 - 273;32 -2 276;20 ·3 279; 7 -1 12;13 '"264 265;27 -119 266;15 +1 269; 3 +1 271;50 + 274;38 +2 277;26 +2 280;14 -1 12;13 -1 "C;
265 266;32 -119 267;20 +1 270; 9 271;57 +6 275;45 278;33 281;21 12; 12
266 267;38 -120 268;26 271; 15 -1 272; 4 +11 276;52 -2 279;40 ·2 282;28 12;12
267 268;43 -119 269;31 +2 272;20 +2 275; 8 + 277;57 +3 281;44 -55 283;55 -20 12;12
268 269;49 -120 270;38 273;26 +1 276;15 + 279; 4 +1 281 ;53 +1 284;42 -1 12;12 -1
269 270;54 -119 271;44 274;32 +1 277;21 + 280;10 +1 282;59 +1 285;48 -1 12; 11 -0
270 270; 0 272;49 275;38 278;27 281; 16 284; 5 286;54 -1 12;11 -
Ascensions of Capricorn and descensions of Cancer
in hours of distance wilh respect to lhe eastern horizon 0
N
<....".:.n " ' ~ l , ; , . . """;1 ""I.Ll...... uu...,...J1 -"'.Jw, ~ = , J 1 ~ )
1 hour 0 hour 1 hour 2 hour 3 hour 4 hour 5 hour 6 hour length
ditt . diff. diff . diff. diff . di ff. diff . diff .
271 271; 6 -1 273;55 -1 276;44 -, 279;33 282;22 -1 285;11 -1 288; 0 -, 12; 11
272 272;11 275; 0 277;48 ., 280;31 + 283;26 +1 286;15 +1 289; 4 -, 12; 11
273 273;11 -1 216; 6 -1 218;54 281;42 + 284;31 +1 281;20 +1 290; 9 -, 12; 11 .,214 214;22 277;11 -1 279;59 -, 282;48 285;35 -1 288;25 -3 291;13 -, 12; 12
215 215;28 -1 218;16 -1 281; 5 -, 283;53 286;41 -2 289;29 -2 292;11 -, 12; 12
216 276;33 -1 279;21 -1 282; 9 -, 284;56 281;44 290;32 293;20 -, 12; 12
277 277;38 280;25 283; 13 -, 286; 0 288;48 -2291;36 -3 294;23 -, 12;12 .,278 278;28 +15 281;30 284; 11 281; 4 289;51 292;38 295;25 -, 12; 13
279 279;48 282;35 -1 285;21 -, 288; 8 290;54 -2 293;40 -2 296;21 -, 12;13 .,280 280;53 283;39 286;25 289; 10 + 291;56 +1 294;42 +1 291;28 -, 12;14 ~
281 281;58 284;43 281;28 290; 14 - 292;59 ·1 295;44 -1 298;29 -, 12;15 Q
282 283; 3 285;48 -1 288;32 -, 291;11 - 294; 1 -2 296;46 -3 299;30 -, 12;15 ., S
283 284; 8 286;52 289;35 ., 292; 19 + 295; 2 +2 297;46 +2 300;30 -, 12;16 "284 285; 13 281;56 290;39 293;21 + 296; 4 +1 298;46 +2 301;30 -, 12;17 •285 286; 18 289; 0 291 ;42 294;24 291; 6 299;48 302;30 -, 12; 18
286 281;23 -1 290; 4 -1 292;45 -, 295;26 - 298; 1 -1 300;48 ·1 303;29 -, 12; 19
287 288;21 291; 7 293;41 296;27 299; 1 301;47 304;21 -, 12;20
288 289;31 292; 10 294;49 297;21 + 300; 6 +1 302;45 +1 305;29 -, 12; 21
289 290;35 293; 13 295;50 ., 298;28 + 301; 6 +1 303;45 306;22 -, 12;22
290 291;39 294; 16 296;52 ., 299;29 + 302; 5 +2 304;45 -1 307;19 12;23
291 292;43 295; 19 -1 297;54 -, 300;30 - 303; 5 -2 305;41 -3308;16 -, 12;24 .,292 293;41 296;21 298;59 -4 301;30 - 304; 5 -2 306;38 -1 309;12 -, 12;26
293 294;51 291;23 +1 299;51 302;28 + 305; 0 +3 301;33 +3 310; 5 ., 12;21
294 295;55 -1 298;26 -1 300;51 -, 303;28 - 306;55 '51308;30 -1 311;28 -25 12;28 .,295 296;58 299;28 301;58 304;28 306;58 309;29 -1 311;58 -, 12;30
296 298; 1 300;29 +1 302;58 ., 305;26 + 307;55 +2 310;24 +2 312;52 12;31
291 299; 4 301;31 303;59 -, 306;26 308;53 -1 311;20 -1 313;47 -, 12;33
298 300; 1 302;32 304;58 -, 301;24 309;49 -2 312;15 -3 314;40 12;34 .,
299 301;10 303;34 306;58 -60 308;22 310;46 313; 10 315;34 -, 12;36
300 302;13 - 1 304;35 -1 306;58 -, 309;20 311;38 +2 314; 5 -3 316;27 -, 12;38
Ascensions of Aquarius and descensions of Leo
in hours of distance with respect to the eastern horizon
(
~
~
I
~
~
I
~
~
I
~
1
.
.
L
.
.
,
~
~
~
I
~
J
L
a
.
.
.
J
~
~
l
~
U
-
)
}. hour 0 hour 1 hour 2 hour 3 hour 4 hour 5 hour 6 hour length
diff. diff. diff. diff. diff. diff. diff. diff.
301 303;15 305;56 ·21 307;56 ·1 310;17 - 312;37 -2 314;56 -1 317;19 -1 12;39 C5'
302 304;17 306;56 -20 308;54 +1 311;13 + 313;32 +1 315;51 +1 318; 10 12;41 ::s
303 305;19 307;36 309;53 312;11 - 314;28 -1 316;45 -1 319; 2 -1 12;43 ~
304 306;21 308;36 310;52 -1 313; 7 . 315;23 -2 317;38 -2 319;53 -1 12;45 f:i'
305 307;23 -1 309;36 311;49 +1 314; 3 + 316;16 +2 318;30 +2 320;44 -1 12;47 Q
....
306 308;24 310;36 -1 312;47 -1 314;59 - 317;10 -2 319;22 -3 321;34 -1 12;48
~
307 309;26 -1 311;36 -1 313;45 316;55 -6 318; 4 +1 320;14 +1 322;24 -1 12;50
308 310;27 -1 312;36 -2 314;42 316; 7 +4 318;57 +1 321; 5 +1 323; 13 -1 12;52 . ~
309 311;28 -1 313;14 +19 315;40 -1 317;45 319;51 321;57 324; 3 -2 12;53 +1 SO...
310 312;29 -1 314;33 -1 316;37 -1 318;40 320;44 322;48 324;52 -2 12;56 ....
S
311 313;30 -1 315;32 -2 317;33 -2 319;35 - 321;36 -3 323;38 -4 325;39 -1 12;58 C)-
312 314; 0 +29 316;30 -2 318;29 -2 320;29 - 322;28 -3 324;28 -4 326;28 -2 13; 0 ~
313 315; 0 +29 317;27 319;20 +5 321;22 + 323;20 +1 325;17 +2 327;15 -1 13; 2 +1 ~
314 316; 0 +29 318;25 -1 320;20 -1 322; 15 - 324;10 -1 326; 5 -1 328; 0 +1 13; 5 .,
8
315 317; 0 +29 319;22 321;15 323; 7 + 325; 0 +1 326;52 +2 328;45 +3 13; 6 +1 :::
316 318;30 -1 320;21 -1 322;12 -1 324; 3 - 325;54 -1 327;45 -1 329;36 -1 13; 9 "is
317 319;29 -1 321;16 +1 323; 7 -1 324;56 - 326;45 -1 328;34 -1 330;23 -2 13;11 §.
00
318 320;28 322;15 -1 324; 1 -1 325;48 . 327;34 -2 329;21 -3 331; 8 -1 13;13 +1 ""319 321;27 323;11 324;46 +9 326;40 - 328;24 -1 330; 9 -2 331;53 -1 13;16 l:>
:::
320 322;26 324; 8 324;50 +60 327;32 329;14 330;56 332;38 13;18 '"S
321 323;25 325; 5 326;44 +1 328;23 + 330; 3 +2 331;43 +2 333;22 +1 13;20 ~
322 324;24 -1 326; 1 -1 327;38 -1 329;14 330;51 332;28 334; 5 +2 13;22 +1 Q
323 325;22 326;57 328;32 330; 7 331 ;42 333;17 334;52 13;25 ~ '"324 326;20 327;52 +1 329;24 +2 330;56 + 332;30 +2 334; 2 +3 335;35 +1 13;27 a
325 327;19 -1 328;49 -1 330;20 -2 331 ;50 - 333;20 -2 334;51 -3 336;21 -1 13;30
326 328;17 -1 329;45 -1331;12 332;40 334; 8 335;56 -20 337; 4 -1 13;32
327 329; 14 330;35 +4 332; 5 -1 333;31 - 334;56 -2 336;20 -1 337;47 -1 13;34 +1
328 330;12 331;35 332;58 334;21 335;44 337; 7 338;30 -1 13;36 +1
329 331;10 -1 332;30 333;51 335;12 336;32 +1 337;53 +1 339; 13 -1 13;39 ......
0
330 332; 7 333;25 334;44 -1 336; 2 - 337;20 -1 338;38 -1 339;56 -1 13;42 v.>
Ascensions of Pisces and descensions of Virgo
in hours of distance with respect to the eastern horizon ~
<.... .,.:.J1 ... i I ,;,... ....n ""I. L.. .... ~ .,.. ow, "",...n ~ )
l hour 0 hour 1 hour 2 hour 3 hour 4 hour 5 hour 6 hour length
diff • diff • diff • diff . diff. diff • diff • diff •
331 333; 4 334;20 -1 335;35 ., 336;51 338; 6 -2 339;25 -6 340;38 -, 13;44
332 334; 1 335;14 336;28 -, 337;41 338;55 -2 340; 8 -2 341;21 ., 13;47
333 334;28 +30 336; 9 -1 337;19 -, 338;30 339;40 -2 340;41 +7 342; 2 ·, 13;49
334 335;55 337; 3 338;11 339;20 340;28 -1 341;36 -1 342;44 -, 13;50 .,335 336;52 -1 337;57 -1 339; 2 -, 340; 8 341;14 -3 342;20 -4 343;25 -, 13;54
336 337;48 338;51 339;54 340;57 342; 0 343; 3 344; 6 13;57
337 338;45 -1 339;45 -1 340;46 ., 341;47 342;17 +27 343;48 ·4 344;48 -, 13;59 .,
338 339;41 340:39 341;37 342;34 + 343;32 +1 344;30 +1 345;38 -10 14; 2
339 340;37 341:32 342;27 343:23 • 344; 18 -1 345;13 -1 346; 8 ., 14; 5
340341;33 342;26 343;18 ., 345;18 -6 345; 4 +1 345;57 +1 346;50 -, 14; 7 ~
341 342;29 343; 19 344; 9 345; 0 - 345;50 -1 346;40 ·1 347;30 14; 9 ., n
342 343;25 344: 13 345; 0 ., 345;48 + 346;35 +2347;23 +2 348;11 ., 14; 12 •343 344;21 345; 6 345;51 346;36 347;21 348; 6 348:51 ., 14; 15 ~
344 345; 16 345;58 346;41 -, 347;24 - 348; 6 -2 348;49 -3 349:31 -, 14; 18
•345346;12 346;52 347:32 348;12 348:51 +1 349;31 +1 350:11 ., 14;20
346 347; 8 347;45 348;23 -, 349; 0 • 349;37 -1350;14 -1 350;51 -, 14;23
347 348; 3 348:38 349:13 349;47 + 350;22 +1 350;56 +2 351;31 -, 14;25 .,
348348;59 -1 349;31 -1 350; 3 -, 350;35 - 351: 7 -1351;39 -1 352;11 -, 14;28
349 349;54 350;23 350:53 ., 351;22 • 352:52 -62 352;21 -2 352;51 -, 14;32 .,
350 350;49 351;16 -1 351:42 -, 352; 5 + 352:56 -23 353: 3 -4 353;30 -, 14:33
351 351 ;45 -1 352; 8 352;32 352;57 - 353:21 -1 353:45 -1 354; 9 ·, 14:36
352 352;40 353; 1 353;23 -, 353;44 - 354: 6 -2 354;27 -2 354;48 -, 14:39
353353;35 353;52 +1 354; 10 ., 354;27 + 354;45 +2 355: 2 +3 355;26 14;42 .,
354 354;30 354;42 +4 355; 2 355;18 355;34 355:50 356; 6 14:44
355 355;25 355;38 355;52 -, 356; 5 356; 19 -2 356;30 356;45 14:47
356 356;20 356;31 356;42 356;53 357: 3 +1 357; 14 +1 357:25 ·, 14;49
357357;15 357;23 357;31 357;39 357;47 357:55 358; 3 14;52
358358;10 358; 16 -1 358;21 -, 358;26 358;32 ·2 358;37 -2 358;42 14;57 .,
359 359; 5 359; 8 359:11 359;13 + 359; 16 +1 359; 18 +2 359;21 14;59 .,
360 360; 0 360; 0 360; 0 360; 0 360; 0 360; 0 360: 0 15: 0
lbn cAzzuZ al-Qusan{rnr's tables for computing planetary aspects 105
Appendix 4. Facsimile edition of pages 428-437 of MS D 2461
106 J. Casulleras
Ibn <Azzaz al-Qusan!fnf's tables
for
computing planetary aspects
107
108 J. Casulleras
~
.
"
,
~
?
J
~
J
I
~
~
J
~
}
.
I
J
-
'
~
?
J
;
J
.
v
j
i
b
~
i
;
r
;
:
~
~
.
~
r I IF-It,
t. f ~ ~ -J) ,,_PII}
,
~
I
~
.t ~ ·t 1.\ , ~ ~ . ~ I ~ ' ~ . : ~ . ~ . '. I-;"S i ~ ~ c ; l < ~~t". ~ , ; , .. ~" ,,,. ...
'" ',," I'" ..' ..... "'''''''''''' t;/J. 'J..,1' / l ~ N -;; II"'" A.. l Lt' -'.a,; r ". V· t. l-:f
Y l..r tV' Jl;.
t.i IJ ..; ..i> .; t .i ;. t ' i - ' t ~IV
.? !s·yrl!. ,1 I: I"" I; ... I": Ib 1.. Ir u> ,p
~
b Ld/ .... i1. .f . ~ ~ q ; J
l,t· l.:r ~... , .., / ~ / e
I J I-J I ~ ~ ' ; ' - .J ..; \. I ••f cP -' $? J
~
.
J
~
,
I
(
"
,
i
t k .7 ~ -J
A· ) h> ) 1-1),r JtC ,
'if~ I .... ~ .J!':' 1-: ~ ..... <C f ' . 1 ~ 1.:1 ) tJ-pJ.f ~ .r ...c
I
~
tl,; < s i , ~ r ~
.(. >- 110 t.R, ). ?' '1 ~ 1',
IY ~ I l : ~ I ~ . .:- r cJ f: J. c:..o U ~ t ~ ..6 I ~ .
tJ (p '.I? JA',.A If, £ l ~ j , ~) 4J ",,'11' 1#- ;io' J ./ J. .rJ .
I
~
i
i.;1 :/ (. L v IQ ~ :»J /' JA IN" .to J.W¥.
• >' I •
1: c.J ;.0 bE.. .,jr, I I.J I ~ ; ,,/ ; ...0 t. AD v
" I).l':.!-,t ,t. (.Q :l R ~ r ;10
I::1.1 u. .J' .
I
~
li! J' ·' ..... IA: J. L:J JJ ~ u , ~ Ir 'i 6'J. ~ /
I'~I ~ ! ! t JI .,; I ',J iJ ..,:(,0 ,..; ~ .,J 4C 'f of ., 'u ~ , ~
~
.
, [ I ' f:k> ".. .§' t7 ~ .:5 to of -!
/
~ r 1 ! e ~, )vI , I.,R.·, :Co'O ..r )<D f, .ro ".., t ( -.6 : ~ ~ /'. I ';N'
fir 111- ' o ~ ~ : ~ t: ~ ~ f i It ..J ~
...... ILI I 1o!J- ,,.LO J 'r' Y!)Z4: U...",.."'" tI- c;
.Y: ,d i ~ t.i.,.,o >- e <J fa ..,J ~ lslp ,) ~ ~ :flU-~
J! .J9IA;;o f I ~ " ' ; Lt I.£J u'4,r, ..... ~ G' J-/,~.
. I..J !...., ...f'-/' .6 t,.. ,,: 4"o,t:. ~ , w · d , t /1 k ,J1
t l / I ~ ! : t ~ ... u..4: ~ /' r" t'>, .1 '-r ).
~1 I f!J-<! .P.o ~ . , J . ~ A . t . w . : / f ~ .r ~ , ~ L
..
j ~ I r ' ! JJ t l.t ~ ~ ~ r t ~ . ~ cJ ~ I . & J . ~
{' I-"'i of .J Le ~ Ja&N.-r ) ~ t.:cJ. t : . . ~ pI
. ! j J ~ ' .
~
l
; J; !' R.o! J2/ ""
~ '"/-l.. ,/'I1 I ---r:t J l ~ ~
, 1,.:1 t. ~ ~ .P .J' ~ (,v' 4'. J 1401 Lvi: lLI/
.'
.. ~ 1 J t , · ~ .{ r!1' .r~J~ i:o- . ~ ~ ~ : L ~
t/,.l4,i·,u ,., ! j ~ ~ f ~ l , ~ ·.-Ia:>J :t- - .. -
lbn rAzzuz al-Qusan!fnl's tables for compuling planetary aspecls 109
110 J. Casulleras
Ibfl cAZZflZ al-Qusafl!{Ilf's tables for computiflg plalletary aspects 111
112 J. Ca ulleras
Ibn 'Azzuz a l - Q u s a n ~ r n r ' s tables for compllting planetary aspects 113
114 J. CasuUeras