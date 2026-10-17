"""German texts for the imported ShowMeMSCI figures (used by import_msci.py).

The figures in the ShowMeMSCI repository are English; the journal shows them in German.
LABELS maps complete strings of the Plotly figures (axis titles, buttons, legend names,
annotations, hover templates); EVENTS gives the short historical note for every calendar
year, matched by year rather than by the English wording.
"""

LABELS = {
    # View buttons and switches
    "Linear View": "Linear",
    "Log₂ View": "Log₂",
    "Annualized": "Annualisiert",
    "Total": "Gesamt",
    "Days": "Tage",
    "Months": "Monate",
    "Years": "Jahre",
    # Axis titles
    "Index level": "Indexstand",
    "Index level (log scale)": "Indexstand (log. Skala)",
    "Cumulative change from Jan 1": "Veränderung seit 1. Januar",
    "Log2 change from Jan 1": "log₂-Veränderung seit 1. Januar",
    "Annual return": "Jahresrendite",
    "Annual log2 return": "log₂ des Wachstumsfaktors",
    "Calendar year": "Kalenderjahr",
    "Holding period in years": "Haltedauer in Jahren",
    "Annualized return": "Annualisierte Rendite",
    "Start year": "Startjahr",
    "Daily return": "Tagesrendite",
    "Monthly return": "Monatsrendite",
    "Observations": "Anzahl",
    # Legend names, slider and annotations
    "Upper bound": "Höchster Wert",
    "Lower bound": "Niedrigster Wert",
    "Average": "Mittelwert",
    "Highlighted year: ": "Hervorgehobenes Jahr: ",
    "Loss Years": "Verlustjahre",
    "Near Flat": "Nahe null",
    "Strong Gains": "Starke Gewinne",
    # Month ticks (Jan, Jul, Sep and Nov are the same in German)
    "Mar": "Mär",
    "May": "Mai",
    "Dec": "Dez",
    # Date formats and axis suffixes
    "%Y-%m-%d": "%d.%m.%Y",
    " years": "",
    # Hover templates
    "<b>%{x:+.2%}</b><br>%{y} observations<extra></extra>":
        "<b>%{x:+.2%}</b><br>%{y} Beobachtungen<extra></extra>",
    "<b>Start %{y}</b><br>Holding period %{x} years<br>Annualized return %{z:+.2%}<extra></extra>":
        "<b>Startjahr %{y}</b><br>Haltedauer %{x} Jahre<br>Rendite p. a. %{z:+.2%}<extra></extra>",
    "<b>Start %{y}</b><br>Holding period %{x} years<br>Total return %{text}<extra></extra>":
        "<b>Startjahr %{y}</b><br>Haltedauer %{x} Jahre<br>Gesamtrendite %{text}<extra></extra>",
    # Plotly 3.0.1 ignores signed fixed-point formats such as "+.2f" in hover templates and
    # prints the raw value; ".2f" is formatted (with the German separators).
    "<b>Upper bound</b><br>%{y:+.2f}%<extra></extra>": "<b>Höchster Wert</b><br>%{y:.2f}%<extra></extra>",
    "<b>Lower bound</b><br>%{y:+.2f}%<extra></extra>": "<b>Niedrigster Wert</b><br>%{y:.2f}%<extra></extra>",
    "<b>Average</b><br>%{y:+.2f}%<extra></extra>": "<b>Mittelwert</b><br>%{y:.2f}%<extra></extra>",
    "<b>%{fullData.name}</b><br>%{customdata}<br>Cumulative change %{y:+.2f}%<extra></extra>":
        "<b>%{fullData.name}</b><br>%{customdata}<br>Veränderung %{y:.2f}%<extra></extra>",
    "<b>%{fullData.name}</b><br>%{customdata}<br>Log2 change %{y:+.2f}<extra></extra>":
        "<b>%{fullData.name}</b><br>%{customdata}<br>log₂-Veränderung %{y:.2f}<extra></extra>",
    "<b>%{customdata[1]}</b><br>Annual return: %{customdata[2]:+.2%}<br>%{customdata[3]}<extra></extra>":
        "<b>%{customdata[1]}</b><br>Jahresrendite: %{customdata[2]:+.2%}<br>%{customdata[3]}<extra></extra>",
    "<b>%{x}</b><br>Annual return %{y:+.2%}<br>%{customdata[0]}<extra></extra>":
        "<b>%{x}</b><br>Jahresrendite %{y:+.2%}<br>%{customdata[0]}<extra></extra>",
    "<b>%{x}</b><br>Log2 return %{y:+.2f}<br>%{customdata[0]}<extra></extra>":
        "<b>%{x}</b><br>log₂-Rendite %{y:.2f}<br>%{customdata[0]}<extra></extra>",
    "%{x|%Y-%m-%d}<br>Index level %{y:,.2f}<extra></extra>":
        "%{x|%d.%m.%Y}<br>Indexstand %{y:,.2f}<extra></extra>",
}

EVENTS = {
    1973: "Ende von Bretton Woods und OPEC-Embargo schüren Stagflationsängste und drücken die Kurse",
    1974: "Tiefe Stagflation: Zweistellige Inflation und starke Kursverluste prägen das Jahr",
    1975: "Erholung nach der Krise: Die Rezession von 1973 bis 1975 endet, die Wirtschaft kommt wieder in Gang",
    1976: "Die Erholung hält trotz hartnäckiger Inflation an, die Wirtschaft wächst unter Preisdruck weiter",
    1977: "Neue Stagflationssorgen bremsen das Wachstum, die Kursgewinne bleiben bescheiden",
    1978: "Kurze Erholung, während sich die Weltwirtschaft vor dem zweiten Ölschock stabilisiert",
    1979: "Die zweite Ölkrise (Iran) treibt die Energiepreise und schürt weltweit die Inflation",
    1980: "Volckers straffe Geldpolitik bekämpft die Inflation; Aktien halten sich, als die Erwartungen ihren Höhepunkt erreichen",
    1981: "Die sich vertiefende „Volcker-Rezession“ und Rekordzinsen belasten die Märkte weltweit",
    1982: "Die Inflation bricht ein, die Rezession endet, und ein neuer Bullenmarkt beginnt",
    1983: "Kräftige Erholung: Sinkende Inflation und weltweites Wachstum stärken das Vertrauen der Anleger",
    1984: "Der Aufschwung hält an, steigende Zinsen und Defizitsorgen dämpfen aber die Begeisterung",
    1985: "Sinkende Inflation und ein schwächerer Dollar lösen Mitte der 80er-Jahre einen kräftigen Aufschwung aus",
    1986: "Der Ölpreisverfall und Japans Vermögenspreisboom bringen ein weiteres Jahr mit außergewöhnlichen Gewinnen",
    1987: "Der Crash am „Schwarzen Montag“ erschüttert die Märkte, die Stärke davor hält das Jahr im Plus",
    1988: "Die Märkte erholen sich vom Schock von 1987, das Wachstum kehrt zurück, die Ängste lassen nach",
    1989: "Der Kalte Krieg endet, die Mauer fällt, und Japans Blase treibt Aktien auf neue Höchststände",
    1990: "Der Irak-Kuwait-Konflikt und der Ölpreissprung lösen einen Ausverkauf und Rezessionsängste aus",
    1991: "Das Ende des Golfkriegs und der Rezession löst eine Erleichterungsrally aus",
    1992: "Eine Erholung ohne neue Arbeitsplätze in den USA und die EWS-Krise in Europa halten die Märkte gedämpft",
    1993: "Niedrige Zinsen und eine sich belebende Weltwirtschaft treiben die Kurse wieder nach oben",
    1994: "Kräftige Zinserhöhungen der Fed lösen ein „Massaker“ am Anleihemarkt aus und bremsen die Aktien",
    1995: "Sanfte Landung der Konjunktur und ein Gewinnboom bei Technologiewerten tragen eine starke Rally",
    1996: "Greenspan warnt vor „irrationalem Überschwang“, während sich der Anstieg beschleunigt",
    1997: "Die Asienkrise trifft Schwellenländeraktien, die westlichen Märkte bleiben weitgehend stabil",
    1998: "Russlands Zahlungsausfall und die Beinahe-Pleite von LTCM erschüttern die Märkte, bis die Fed eingreift",
    1999: "Der Dotcom-Rausch treibt Technologiewerte und Indizes auf Rekordhöhen",
    2000: "Die Dotcom-Blase platzt und leitet einen weltweiten Abschwung ein",
    2001: "Weltweite Rezession und die Anschläge vom 11. September lösen einen scharfen Einbruch aus",
    2002: "Bilanzskandale und eine schleppende Erholung verlängern den Bärenmarkt",
    2003: "Das schnelle Ende des Irakkriegs und extrem niedrige Zinsen lösen eine kräftige Erholung aus",
    2004: "Stetiges Wachstum bei niedrigen Zinsen hält die Rally trotz steigender Rohstoffpreise am Laufen",
    2005: "Rekordölpreise und weitere Zinserhöhungen der Fed begrenzen die Gewinne",
    2006: "Ein weltweiter Boom, angeführt von großen Schwellenländern, treibt die Aktien nach oben",
    2007: "Der kreditgetriebene Optimismus erreicht seinen Höhepunkt; gegen Jahresende zeigen sich Risse am Immobilienmarkt",
    2008: "Globale Finanzkrise: Bankenpleiten lösen einen weltweiten Kurseinbruch aus",
    2009: "Massive fiskal- und geldpolitische Hilfen sorgen für eine kräftige Erholung von den Krisentiefs",
    2010: "Die Erholung geht weiter, Europas Schuldenkrise sorgt aber für Schwankungen",
    2011: "Turbulenzen in der Eurozone und die Herabstufung der US-Bonität sorgen für starke Schwankungen",
    2012: "Das „Whatever it takes“ der EZB beruhigt die Eurokrise und stellt das Vertrauen wieder her",
    2013: "Anleihekäufe der Notenbanken und weltweit gleichzeitiges Wachstum bescheren Aktien ein außergewöhnliches Jahr",
    2014: "Moderate Gewinne, während die Fed ihre Anleihekäufe beendet und der Ölpreis gegen Jahresende einbricht",
    2015: "Wachstumssorgen um China und die erste Zinserhöhung der Fed seit fast zehn Jahren lassen Aktien auf der Stelle treten",
    2016: "Brexit und US-Wahl erhöhen die Schwankungen, die Märkte steigen dennoch langsam",
    2017: "Weltweiter Aufschwung bei niedriger Inflation und geringen Schwankungen bringt kräftige Gewinne",
    2018: "Der Handelskrieg zwischen den USA und China und die straffere Geldpolitik der Fed führen zu breiten Verkäufen",
    2019: "Die Notenbanken lockern wieder, der Handelsstreit entspannt sich, und die Kurse steigen kräftig",
    2020: "Dem Corona-Crash folgen beispiellose Hilfsprogramme, die Märkte erholen sich rasch",
    2021: "Öffnungen dank Impfstoffen und Rekordgewinne heben die Märkte auf neue Höchststände",
    2022: "Inflationsschub, kräftige Zinserhöhungen und der Krieg in der Ukraine lösen einen steilen Abschwung aus",
    2023: "Nachlassende Inflation und ein KI-getriebener Technologieboom sorgen trotz hoher Zinsen für eine starke Erholung",
    2024: "Der weltweite Zinssenkungszyklus beginnt; KI-Schwergewichte treiben die Gewinne, Zinssenkungen gleichen Wahlrisiken aus",
    2025: "Kräftige Gewinne dank solider Unternehmensergebnisse, nachlassender Inflation und anhaltendem KI-Schwung",
}
