document.addEventListener("DOMContentLoaded", () => {
  const select = document.getElementById("indice");
  const info = document.getElementById("info");
  const status = document.getElementById("status");
  const button = document.getElementById("exportar");

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        func: () => {
          return Array.from(document.querySelectorAll("table")).map(
            (table, index) => `Tabela ${index + 1}`
          );
        },
      },
      (results) => {
        const tables = results[0].result;

        if (!tables || tables.length === 0) {
          info.textContent = "Nenhuma tabela encontrada nesta página.";
          button.disabled = true;
          return;
        }

        info.textContent = `Foram encontradas ${tables.length} tabelas nesta página.`;

        tables.forEach((label, index) => {
          const option = document.createElement("option");
          option.value = index;
          option.textContent = label;
          select.appendChild(option);
        });
      }
    );
  });

  button.addEventListener("click", () => {
    const selectedIndex = select.value;

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id },
          args: [Number(selectedIndex)],
          func: (index) => {
            const table = document.querySelectorAll("table")[index];
            let csv = "";

            for (const row of table.rows) {
              const cells = Array.from(row.cells).map(cell =>
                `"${cell.innerText.replace(/"/g, '""')}"`
              );
              csv += cells.join(";") + "\n";
            }

            const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "tabela.csv";
            link.click();
          },
        },
        () => {
          status.textContent = `Tabela ${Number(selectedIndex) + 1} exportada com sucesso!`;
        }
      );
    });
  });
});


// Quando clicar em exportar
botao.addEventListener("click", () => {
  const indice = Number(select.value);

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: extrairTabela,
      args: [indice]
    });
  });
});

// Funções executadas na página
function contarTabelas() {
  return document.querySelectorAll("table").length;
}

function extrairTabela(indice) {
  const tabelas = document.querySelectorAll("table");
  const table = tabelas[indice];

  if (!table) {
    alert("Tabela não encontrada");
    return;
  }

  let csv = [];
  for (let row of table.rows) {
    let cols = [...row.cells].map(cell =>
      `"${cell.innerText.replace(/"/g, '""')}"`
    );
    csv.push(cols.join(","));
  }

  const blob = new Blob([csv.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `tabela_${indice + 1}.csv`;
  a.click();
}
